import "./App.css";
import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";
import { NoServiceView, HalfChat } from '@dartfrog/puddle';
import { PROCESS_NAME, WEBSOCKET_URL } from "./utils";
import useClickerStore from "./store/clicker";
import ClickerPluginBox from "./components/ClickerPluginBox";

function App() {


  return (
    <Router basename={`/${PROCESS_NAME}`}>
      <Routes>
        <Route path="/" element={
          <NoServiceView processName={PROCESS_NAME} websocketUrl={WEBSOCKET_URL} ourNode={window.our?.node} />
        } />
        <Route path="/df/service/:id" element={<ServiceRoute />} />
      </Routes>
    </Router>
  );
}

function ServiceRoute() {
  const { id } = useParams();

  const {handleUpdate} = useClickerStore();

  const onServiceMessage = (msg) => {
    if (msg.Clicker) {
      handleUpdate(msg.Clicker);
    }
  };

  return (
    <HalfChat
      ourNode={window.our?.node}
      Element={ClickerPluginBox}
      processName={PROCESS_NAME}
      websocketUrl={WEBSOCKET_URL}
      onServiceMessage={onServiceMessage}
      enableChatSounds
      paramServiceId={id}
    />
  );
}

export default App;
