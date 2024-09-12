import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { NoServiceView, HalfChat } from '@dartfrog/puddle';
import { PROCESS_NAME, WEBSOCKET_URL } from "./utils";
import usePageStore from "./store/page";
import PagePluginBox from "./components/PagePluginBox";

function App() {

  const {page, setPage} = usePageStore();

  const onServiceMessage = (msg) => {
    if (msg.Page) {
      setPage(msg.Page.Page);
    }
  };

  return (
    <Router basename={`/${PROCESS_NAME}`}>
      <Routes>
        <Route path="/" element={
          <NoServiceView processName={PROCESS_NAME} websocketUrl={WEBSOCKET_URL} ourNode={window.our?.node} />
        } />
        <Route path="/df/service/:id" element={
          <HalfChat
            ourNode={window.our?.node}
            Element={PagePluginBox}
            processName={PROCESS_NAME}
            websocketUrl={WEBSOCKET_URL}
            onServiceMessage={onServiceMessage}
            enableChatSounds
           />
        } />
      </Routes>
    </Router>
  );
}

export default App;
