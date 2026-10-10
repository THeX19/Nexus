# Nexus

Nexus is a desktop system utility for **Windows and Arch Linux**, built with Tauri and React. It provides system monitoring, process management, storage analysis, network diagnostics, and command execution.

Nexus is currently in **beta**. Features, performance improvements, and bug fixes are actively being developed.

## Features

- Live CPU and memory charts with session history.
- Memory and storage capacity gauges.
- Process search, sorting, pagination, and pause/resume.
- Process termination controls with confirmation and protection for critical processes.
- Recursive folder size analysis, scan cancellation, and skipped-entry reporting.
- Network interface information and custom ping tests.
- Command execution with history, exit codes, output limits, and timeouts.
- Five themes, saved preferences, keyboard navigation, and reduced-motion support.
- English, German, and French interface labels.

Available features and behavior may differ between Windows and Linux.

## Install on Windows

Download the Windows installer provided with the release, run it, and follow the installation prompts.

If no Windows installer is attached, that release does not include a packaged Windows build.

## Install on Arch Linux

### Pacman package

If the release includes `nexus-0.3.0-1-x86_64.pkg.tar.zst`, download it and run:

```bash
sudo pacman -U ./nexus-0.3.0-1-x86_64.pkg.tar.zst
nexus
```

Launch Nexus from your graphical desktop session. Node.js and Rust are not required to run the compiled application.

### Per-user installation

Download `nexus-0.3.0-linux-x86_64.tar.gz`, then run:

```bash
sudo pacman -S --needed webkit2gtk-4.1 gtk3 iproute2 iputils python
tar -xzf nexus-0.3.0-linux-x86_64.tar.gz
cd nexus-0.3.0-linux-x86_64
./install.sh
~/.local/bin/nexus
```

See the [Arch installation guide](https://github.com/THeX19/Nexus/blob/v0.3.0/docs/INSTALL-ARCH.md) for verification, upgrades, removal, and troubleshooting.

## Interface and Functionality

- Responsive sidebar, consistent layouts, a custom icon, and five themes.
- Live resource charts with bounded history and connection status.
- Saved preferences, configurable refresh intervals, reduced motion, and in-app resource alerts.
- Process pagination, sorting, filtering, pause/resume, and termination confirmation.
- Storage scans with nested folder sizes, cancellation, and stale-result handling.
- Network diagnostics with IPv6 information and custom ping hosts.
- Command history, session persistence, exit codes, output limits, and a 30-second timeout.

## Latest Source Improvements

- More reliable startup CPU measurements.
- Dashboard CPU sampling isolated from process polling.
- Process CPU percentages normalized to total machine capacity.
- Memory and storage gauges display percentages to one decimal place.
- Duplicate and outdated telemetry no longer distort chart history.
- Fixed stale polling responses when refresh settings or polling state change.
- Reduced unnecessary CPU reads, interface updates, and repeated filtering work.

These improvements are in the current source. The existing 0.3.0 download archives need rebuilding before they include these changes.

## Release Downloads

Depending on the release, attached files may include:

- **Windows installer:** installs Nexus on Windows.
- **Arch Linux pacman package:** installs Nexus through `pacman`.
- **Linux `.tar.gz` archive:** contains the compiled application, installer, and supporting files.
- **Source ZIP:** contains source code, tests, build scripts, and documentation.
- **SHA256SUMS:** contains checksums for the matching release assets.

Download the package intended for your operating system. The source ZIP is for development or building Nexus yourself.

### Verify Linux downloads

Download the files listed in `SHA256SUMS`, then run:

```bash
sha256sum --check SHA256SUMS
```

Always use the checksum file supplied with the same release assets.

## Beta Status and Testing

For the latest source changes, all **nine frontend tests** and the **production TypeScript/Vite build** pass.

Two additional Rust regression tests have been added. Rust tests, formatting, and Clippy for these changes remain pending because Cargo was unavailable in the development environment.

Native desktop verification of the latest changes, platform-specific testing, installation on a separate Arch machine, and verification of the GitHub release workflow remain pending.

Beta releases may contain bugs, and features may change between versions.

## Known Limitations

- No automatic updater.
- Linux packages target Arch Linux x86_64.
- Platform-specific features and behavior may differ.
- The built-in console is a bounded command runner, not an interactive terminal.

## Report a Bug

Please include:

- Your Nexus version.
- Your operating system and version.
- Steps to reproduce the problem.
- What you expected and what happened.
- Relevant screenshots or error messages.

[Report an issue](https://github.com/THeX19/Nexus/issues)

## License

Nexus is licensed under the **MIT License**. See the included `LICENSE` file.


