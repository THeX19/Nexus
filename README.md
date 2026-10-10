# Nexus

Nexus is a Windows desktop system utility focused on system monitoring, process management, and system interaction.

The project is currently in an early alpha stage. The core application is functional, but some features are still being developed and performance improvements and bug fixes are ongoing.

## Current Status

- Desktop application built with Tauri
- React-based user interface
- System monitoring
- Process search
- Initial system utilities
- Early-stage UI and functionality

## Development

Nexus is actively being developed. Features may change significantly between versions, and the current release should be considered experimental.

## License

License information will be added in a future release.


**Prerelease for Arch Linux x86_64.** This release brings a redesigned interface, five themes, live resource charts, saved preferences, and more reliable process, storage, network, and console tools.

## Install on Arch

Download `nexus-0.3.0-1-x86_64.pkg.tar.zst` from this release, then run from its download folder:

```bash
sudo pacman -U ./nexus-0.3.0-1-x86_64.pkg.tar.zst
nexus
```

Pacman resolves `webkit2gtk-4.1`, `gtk3`, `iproute2`, and `iputils`. Launch from your ordinary graphical desktop session. Node.js and Rust are unnecessary for running the package.

Read the [complete installation guide](https://github.com/THeX19/Nexus/blob/v0.3.0/docs/INSTALL-ARCH.md) for verification, per-user installation, upgrades, removal, and troubleshooting.

## Per-user alternative

Download `nexus-0.3.0-linux-x86_64.tar.gz` and run:

```bash
sudo pacman -S --needed webkit2gtk-4.1 gtk3 iproute2 iputils python
tar -xzf nexus-0.3.0-linux-x86_64.tar.gz
cd nexus-0.3.0-linux-x86_64
./install.sh
~/.local/bin/nexus
```

## Changes

- Responsive sidebar, consistent layouts, custom icon, keyboard navigation, and five themes.
- Live CPU/memory charts with bounded session history and truthful telemetry status.
- Persisted settings, working refresh interval, reduced motion, and in-app resource alerts.
- Process pagination, sorting, search, pause/resume, confirmation, and PID protection.
- Recursive folder sizes, cancellation, skipped-entry reporting, and stale-result handling.
- IPv6 parsing, custom ping hosts, copying, and clearer network states.
- Console history, session persistence, exit codes, output limits, 30-second timeout, and Unix descendant cleanup.
- English, German, and French labels; MIT licensing; versioned packaging and checksums.

## Assets and verification

The pacman package is recommended. The tar.gz includes the native executable, installer, icon, README, and license. The source ZIP includes source, tests, build scripts, and documentation. `SHA256SUMS` covers the three assets; download them together and run `sha256sum --check SHA256SUMS`, or follow the installation guide to verify just one.

## Validation and remaining checks

Production build, seven frontend tests, eight Rust tests, Rust Clippy with warnings denied, archive inspection, installer checks, and checksum verification passed locally. Desktop interaction, installation on a separate Arch machine, and execution of the GitHub workflow remain pending. Screenshots could not be captured in the restricted development session. See the [release checklist](https://github.com/THeX19/Nexus/blob/v0.3.0/docs/RELEASE-CHECKLIST.md).

There is no automatic updater. These builds target Arch Linux x86_64; other platforms are unverified. The console is a bounded command runner, not an interactive terminal. See README for all current limits.


