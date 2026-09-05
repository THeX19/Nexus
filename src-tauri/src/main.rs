// Prevents additional console window on Windows in release, debug, and test modes
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Serialize, Deserialize};
use sysinfo::{System, DiskUsage};
use std::sync::{Arc, Mutex};
use tauri::{State, Emitter};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SystemStats {
    pub cpu_usage: f32,
    pub ram_used: u64,
    pub ram_total: u64,
    pub ram_usage_pct: f32,
    pub disk_used: u64,
    pub disk_total: u64,
    pub disk_usage_pct: f32,
    pub uptime: u64,
}

pub struct SystemState {
    pub sys: Arc<Mutex<System>>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_system_stats(state: State<'_, SystemState>) -> Result<SystemStats, String> {
    let mut sys = state.sys.lock().map_err(|e| e.to_string())?;

    // Refresh system info
    sys.refresh_cpu();
    sys.refresh_memory();

    let cpu_usage = sys.global_cpu_info().cpu_usage();
    let ram_used = sys.used_memory();
    let ram_total = sys.total_memory();
    let ram_usage_pct = (ram_used as f32 / ram_total as f32) * 100.0;

    // Aggregate disk usage across all disks
    let mut total_disk_space = 0;
    let mut used_disk_space = 0;
    for disk in &sysinfo::Disks::new_with_refreshed_list() {
        total_disk_space += disk.total_space();
        used_disk_space += disk.total_space() - disk.available_space();
    }

    let disk_usage_pct = if total_disk_space > 0 {
        (used_disk_space as f32 / total_disk_space as f32) * 100.0
    } else {
        0.0
    };

    Ok(SystemStats {
        cpu_usage,
        ram_used,
        ram_total,
        ram_usage_pct,
        disk_used: used_disk_space,
        disk_total: total_disk_space,
        disk_usage_pct,
        uptime: System::uptime(),
    })
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu_usage: f32,
    pub memory: u64,
    pub disk_usage: u64,
    pub status: String,
    pub parent_pid: Option<u32>,
    pub exe_path: String,
}

#[tauri::command]
fn search_processes(query: String, state: State<'_, SystemState>) -> Result<Vec<ProcessInfo>, String> {
    let processes = get_processes(state)?;
    let query_lower = query.to_lowercase();

    Ok(processes.into_iter()
        .filter(|p| p.name.to_lowercase().contains(&query_lower) || p.exe_path.to_lowercase().contains(&query_lower))
        .collect())
}

#[tauri::command]
fn get_processes(state: State<'_, SystemState>) -> Result<Vec<ProcessInfo>, String> {
    let mut sys = state.sys.lock().map_err(|e| e.to_string())?;
    sys.refresh_all();

    let processes = sys.processes().iter().map(|(pid, process)| {
        ProcessInfo {
            pid: pid.as_u32(),
            name: process.name().to_string(),
            cpu_usage: process.cpu_usage(),
            memory: process.memory(),
            disk_usage: process.disk_usage().read_bytes,
            status: format!("{:?}", process.status()),
            parent_pid: process.parent().map(|p| p.as_u32()),
            exe_path: process.exe().map(|p| p.to_string_lossy().into_owned()).unwrap_or_default(),
        }
    }).collect();

    Ok(processes)
}

#[tauri::command]
fn kill_process(pid: u32, state: State<'_, SystemState>) -> Result<(), String> {
    let mut sys = state.sys.lock().map_err(|e| e.to_string())?;
    if let Some(process) = sys.process(sysinfo::Pid::from(pid as usize)) {
        process.kill();
        Ok(())
    } else {
        Err("Process not found".to_string())
    }
}

#[tauri::command]
fn force_kill_process(pid: u32, state: State<'_, SystemState>) -> Result<(), String> {
    use std::process::Command;
    let status = Command::new("cmd")
        .args(["/C", "taskkill", "/F", "/PID", &pid.to_string()])
        .status()
        .map_err(|e| e.to_string())?;

    if status.success() {
        Ok(())
    } else {
        Err("Failed to force kill process".to_string())
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DiskNode {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub is_dir: bool,
    pub children: Option<Vec<DiskNode>>,
}

#[tauri::command]
fn get_disk_usage(path: String, depth: usize, state: State<'_, SystemState>) -> Result<DiskNode, String> {
    use jwalk::WalkDir;

    let mut total_size = 0;
    let mut children = Vec::new();

    // We only scan to the requested depth for the initial view
    for entry in WalkDir::new(&path).into_iter().filter_map(|e| e.ok()) {
        let depth = entry.depth();
        if depth == 0 { continue; } // root is handled by the caller
        if depth > 1 { continue; } // Only one level for this simple implementation

        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        let size = metadata.len();
        total_size += size;

        children.push(DiskNode {
            name: entry.file_name().to_string_lossy().into_owned(),
            path: entry.path().to_string_lossy().into_owned(),
            size,
            is_dir: metadata.is_dir(),
            children: None,
        });
    }

    Ok(DiskNode {
        name: std::path::Path::new(&path).file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or(path.clone()),
        path,
        size: total_size,
        is_dir: true,
        children: Some(children),
    })
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct NetworkInterface {
    pub name: String,
    pub ipv4: String,
    pub ipv6: String,
    pub mac: String,
    pub status: String,
}

#[tauri::command]
fn get_network_info() -> Result<Vec<NetworkInterface>, String> {
    use std::process::Command;
    use std::io::Read;

    let output = Command::new("ipconfig")
        .output()
        .map_err(|e| e.to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut interfaces = Vec::new();
    let mut current_interface = None;

    for line in stdout.lines() {
        let line = line.trim();
        if line.is_empty() { continue; }

        if line.contains("Ethernet adapter") || line.contains("Wireless LAN adapter") || line.contains("Software Loopback Interface") {
            if let Some(intf) = current_interface {
                interfaces.push(intf);
            }
            current_interface = Some(NetworkInterface {
                name: line.to_string(),
                ipv4: "N/A".to_string(),
                ipv6: "N/A".to_string(),
                mac: "N/A".to_string(),
                status: "Unknown".to_string(),
            });
        } else if let Some(ref mut intf) = current_interface {
            if line.contains("IPv4 Address") {
                intf.ipv4 = line.split(':').last().unwrap_or("N/A").trim().to_string();
            } else if line.contains("IPv6 Address") {
                intf.ipv6 = line.split(':').last().unwrap_or("N/A").trim().to_string();
            } else if line.contains("Physical Address") {
                intf.mac = line.split(':').last().unwrap_or("N/A").trim().to_string();
            } else if line.contains("Media State") {
                intf.status = line.split(':').last().unwrap_or("N/A").trim().to_string();
            }
        }
    }

    if let Some(intf) = current_interface {
        interfaces.push(intf);
    }

    Ok(interfaces)
}

fn main() {
    let system_state = SystemState {
        sys: Arc::new(Mutex::new(System::new_all())),
    };
    let state_clone = system_state.sys.clone();

    tauri::Builder::default()
        .manage(system_state)
        .setup(move |app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    {
                        let mut sys = state_clone.lock().unwrap();
                        sys.refresh_cpu();
                        sys.refresh_memory();

                        // We can't call get_system_stats directly because it needs State
                        // but we can manually create the stats object
                        let ram_used = sys.used_memory();
                        let ram_total = sys.total_memory();
                        let mut total_disk_space = 0;
                        let mut used_disk_space = 0;
                        for disk in &sysinfo::Disks::new_with_refreshed_list() {
                            total_disk_space += disk.total_space();
                            used_disk_space += disk.total_space() - disk.available_space();
                        }

                        let stats = SystemStats {
                            cpu_usage: sys.global_cpu_info().cpu_usage(),
                            ram_used,
                            ram_total,
                            ram_usage_pct: (ram_used as f32 / ram_total as f32) * 100.0,
                            disk_used: used_disk_space,
                            disk_total: total_disk_space,
                            disk_usage_pct: if total_disk_space > 0 {
                                (used_disk_space as f32 / total_disk_space as f32) * 100.0
                            } else {
                                0.0
                            },
                            uptime: System::uptime(),
                        };

                        if let Err(e) = handle.emit("sys-stats-update", stats) {
                            eprintln!("Failed to emit system stats: {}", e);
                        }
                    }
                    tokio::time::sleep(std::time::Duration::from_secs(2)).await;
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, get_system_stats, get_processes, search_processes, kill_process, force_kill_process, get_disk_usage, get_network_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
