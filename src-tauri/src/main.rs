// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::error::Error;

fn app_startup(app: &mut tauri::App) -> Result<(), Box<dyn Error>> {
    let app_dir_option = app.path_resolver().app_config_dir();
    const CONFIG: &str = include_str!("./config_template.json");
    match app_dir_option {
        Some(app_dir) => {
            if !app_dir.exists() {
                std::fs::create_dir_all(&app_dir).expect("Failed to create app directory");
            }
            let config_file_path = app_dir.join("config.json");
            if !config_file_path.exists() {
                std::fs::write(&config_file_path, CONFIG).expect("Failed to create config file");
            }
        }
        None => {
            return Err("Failed to get app directory".into());
        }
    }

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(app_startup)
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
