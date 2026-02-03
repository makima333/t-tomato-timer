// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::error::Error;

use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};
use tauri_plugin_window_state::StateFlags;

fn app_startup(app: &mut tauri::App) -> Result<(), Box<dyn Error>> {
    const CONFIG: &str = include_str!("./config_template.json");

    let app_dir_option = match app.path().app_config_dir() {
        Ok(app_dir) => app_dir,
        Err(e) => {
            println!("Failed to get app directory: {}", e);
            return Err("Failed to get app directory".into());
        }
    };

    if !app_dir_option.exists() {
        std::fs::create_dir_all(&app_dir_option).expect("Failed to create app directory");
    }
    let config_file_path = app_dir_option.join("config.json");
    if !config_file_path.exists() {
        std::fs::write(&config_file_path, CONFIG).expect("Failed to create config file");
    }

    let main_window = app
        .get_webview_window("tttimer")
        .expect("Main window not found");

    let app_handle = app.handle().clone();

    main_window.on_window_event(move |event| {
        if let tauri::WindowEvent::CloseRequested { .. } = event {
            // app_handleから全ウィンドウを取得
            let windows = app_handle.webview_windows();

            // 他のウィンドウを閉じる
            for (label, window) in &windows {
                if label != "tttimer" {
                    let _ = window.close();
                }
            }

            // メインウィンドウを閉じる
            if let Some(main) = windows.get("tttimer") {
                let _ = main.close();
            }
        }
    });

    Ok(())
}

fn main() {
    let state_flags = StateFlags::POSITION;

    let migrations = vec![Migration {
        version: 1,
        description: "Initial migration",
        sql: include_str!("./migrations/000_initial.sql"),
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:mydatabase.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(state_flags)
                .build(),
        )
        .setup(app_startup)
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
