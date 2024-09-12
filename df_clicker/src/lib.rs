use dartfrog_lib::{default_load_service, default_save_service, provider_handle_message, update_subscriber, update_subscribers, AppServiceState, ChatRequest, ChatServiceState, ChatUpdate, DefaultAppClientState, DefaultAppProcessState, ProviderState, Service};
use kinode_process_lib::{call_init, http, Address, Request};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

wit_bindgen::generate!({
    path: "target/wit",
    world: "process-v0",
});

type AppProviderState = ProviderState<AppService, DefaultAppClientState, DefaultAppProcessState>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppService {
    pub chat: ChatServiceState,
    pub clicker: ClickerServiceState,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AppUpdate {
    Chat(ChatUpdate),
    Clicker(ClickerUpdate),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AppRequest {
    Chat(ChatRequest),
    Clicker(ClickerRequest),
}

#[derive(Debug, Clone)]
pub struct AppState {
    pub provider: AppProviderState,
}

impl AppState {
    pub fn new(our:&Address) -> Self {
        AppState {
            provider: AppProviderState::new(our),
        }
    }
}

impl AppServiceState for AppService {
    fn new() -> Self {
        AppService {
            chat: ChatServiceState::new(),
            clicker: ClickerServiceState::new(),
        }
    }

    fn init(&mut self, our: &Address, service: &Service) -> anyhow::Result<()> {
        default_load_service::<Self>(our, &service.id.to_string(), self)
    }

    fn save(&mut self, our: &Address, service: &Service) -> anyhow::Result<()> {
        default_save_service::<Self>(our, &service.id.to_string(), self)
    }

    fn handle_subscribe(&mut self, subscriber_node: String, our: &Address, service: &Service) -> anyhow::Result<()> {
        self.chat.handle_subscribe(subscriber_node.clone(), our, service)?;
        self.clicker.handle_subscribe(subscriber_node, our, service)?;
        self.save(our, service)?;
        Ok(())
    }

    fn handle_request(&mut self, from: String, req: String, our: &Address, service: &Service) -> anyhow::Result<()> {
        let request = serde_json::from_str::<AppRequest>(&req)?;
        match request {
            AppRequest::Chat(chat_request) => {
                self.chat.handle_request(from, chat_request, our, service)?;
            }
            AppRequest::Clicker(clicker_request) => {
                self.clicker.handle_request(from, clicker_request, our, service)?;
            }
        }
        self.save(our, service)?;
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ClickerUpdate {
    ClickMap(HashMap<String, u32>),
    ClickMapNode(String, u32),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ClickerRequest {
    Click,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClickerServiceState {
    pub click_map: HashMap<String, u32>,
}

impl ClickerServiceState {
    fn new() -> Self {
        ClickerServiceState {
            click_map: HashMap::new(),
        }
    }

    fn handle_subscribe(&mut self, subscriber_node: String, our: &Address, service: &Service) -> anyhow::Result<()> {
        let upd = ClickerUpdate::ClickMap(self.click_map.clone());
        update_subscriber(AppUpdate::Clicker(upd), &subscriber_node, our, service)?;
        Ok(())
    }

    fn handle_request(&mut self, from: String, req: ClickerRequest, our: &Address, service: &Service) -> anyhow::Result<()> {
        match req {
            ClickerRequest::Click => {
                let count = self.click_map.entry(from.clone()).or_insert(0);
                *count += 1;
                // Use ClickMapNode update instead of ClickMap
                let upd = ClickerUpdate::ClickMapNode(from, *count);
                update_subscribers(AppUpdate::Clicker(upd), our, service)?;
            }
        }
        Ok(())
    }
}

call_init!(init);
fn init(our: Address) {
    println!("init clicker");
    let mut state = AppState::new(&our);
    let loaded_provider = AppProviderState::load(&our);
    state.provider = loaded_provider;

    let try_ui = http::secure_serve_ui(&our, "df-clicker-ui", vec!["/", "*"]);
    http::secure_bind_ws_path("/", true).unwrap();

    match try_ui {
        Ok(()) => {}
        Err(e) => {
            println!("error starting ui: {:?}", e);
        }
    };

    Request::to(("our", "homepage", "homepage", "sys"))
        .body(
            serde_json::json!({
                "Add": {
                    "label": "df-clicker",
                    "path": "/",
                }
            })
            .to_string()
            .as_bytes()
            .to_vec(),
        )
        .send()
        .unwrap();

    loop {
        match provider_handle_message(&our, &mut state.provider) {
            Ok(()) => {}
            Err(e) => {
                println!("error handling message: {:?}", e);
            }
        };
    }
}