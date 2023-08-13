import React from 'react'
import './main.css'
import { createRoot } from 'react-dom/client';
import {Config} from "./utils/config";
import {actions, connectRootComponent} from './actions-integration';
import {AboveApp} from './react/AboveApp';
import {deprecate} from './decorators/decorators';


class TestMe
{
  constructor() {
  }

  mymethod() {
    console.log("I'm a deprecated method");
  }

}



const x = new TestMe();
x.mymethod();

(async ()=>{
  try {

    const config = await Config.fetch('/config/testconfig.yaml');
    actions.local.ingestConfig(config);
    const RootComponent = connectRootComponent(AboveApp) as unknown as React.FunctionComponent;
    const container = document.getElementById('root');
    const root = createRoot(container!); // createRoot(container!) if you use TypeScript
    root.render(<RootComponent/>);
  } catch(e) {
    console.error(e);
  }
})();
