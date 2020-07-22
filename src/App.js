/* eslint-disable */

import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  createTelescope,
  TelescopeProvider,
  Signal,
  Relay,
  useSignal,
  useProperty,
  Num,
  Str,
  Bool,
  Schema,
} from "@idiosync/telescope";




// Setup
const telescope = createTelescope(true);

telescope.registerSignals({
  OPEN_POPUP: Signal(),
  CLOSE_POPUP: Signal(),
  SET_TICKBOX: Signal(),
});

telescope.createModels({
  DISPLAY: Schema({
    tickboxIsClicked: Bool(),
    number: Num(),
    inputIsShowing: Bool(),
  }),
});



// some middleware
const bumpNumber = (data, app) => {
  const DISPLAY = app.model(models => models.DISPLAY);
  const number = DISPLAY.getProp("number");
  DISPLAY.setProp("number", number ? number + 1 : 1);
};

const setPopupVisible = isVisible => (data, app) => {
  app.model(models => models.DISPLAY).setProp("inputIsShowing", isVisible);
};

const setTickboxState = (data, app) => {  // here we grab the payload from the signal
  app.model(models => models.DISPLAY).setProp("tickboxIsClicked", data.payload.inputValue);
}

const alertUserOfTickbox = (data, app) => alert('you must click the magic tickbox') 



// this is a guard
const tickboxIsEnabled = (data, app) => app.model(models => models.DISPLAY).getProp('tickboxIsClicked');  

// create a scope (a middleware with only one argument)
// this is a way to combine and arrange middleware and other scopes
// it also allows for if / elseif /else statments
const closePopupIfTextboxIsEnabled = scope =>
  scope.if(tickboxIsEnabled)(
    setPopupVisible(false)
  ).else(
    alertUserOfTickbox 
  )




// map scopes to signals
telescope.on(signals => signals.OPEN_POPUP,
  scope => scope(
    bumpNumber, 
    setPopupVisible(true)
  )
);

telescope.on(signals => signals.CLOSE_POPUP,
  closePopupIfTextboxIsEnabled 
);

telescope.on(signals => signals.SET_TICKBOX,
  scope => scope(
    setTickboxState
  )
)




// components

function App() {
  return (
    <TelescopeProvider telescope={telescope}>
      <Main />
    </TelescopeProvider>
  );
}





const Main = () => {
  const OPEN_POPUP = useSignal(signals => signals.OPEN_POPUP);

  const inputIsShowing = useProperty(
    models => models.DISPLAY,
    "inputIsShowing"
  );

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <ButtonAndText onClick={() => OPEN_POPUP()} clickToText="HELLO WORLD!" />
        {!!inputIsShowing && <InputPopup />}
      </header>
    </div>
  );
};



const InputPopup = () => {
  const number = useProperty(models => models.DISPLAY, "number");

  const CLOSE_POPUP = useSignal(signals => signals.CLOSE_POPUP);
  const SET_TICKBOX = useSignal(signals => signals.SET_TICKBOX);

  const [inputValue, setInputValue] = useState(false);
  
  useEffect(() => {
    SET_TICKBOX({inputValue}); 
  }, [inputValue])

  return (
    <div
      style={{
        height: "70%",
        width: "70%",
        position: "absolute",
        backgroundColor: "white",
        color: "black",
      }}
    >
      <h1>HELLO WORLD!</h1>
      <p>{`You have clicked ${number} times`}</p>
      <label>
          magic tickbox
        <input value={inputValue} onChange={() => setInputValue(!inputValue)} type="checkbox" /> 
      </label>
      <ButtonAndText onClick={() => CLOSE_POPUP()} clickToText="close" />
    </div>
  );
};





const ButtonAndText = ({ onClick, clickToText }) => {
  return (
    <div>
      <p>{`Click the button to ${clickToText}!`}</p>
      <button
        onClick={onClick}
        style={{ height: 100, width: 100, backgroundColor: "red" }}
      >
        press
      </button>
    </div>
  );
};

export default App;
