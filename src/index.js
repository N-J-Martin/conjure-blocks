/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * EDITED by N-J-Martin
 */

import * as Blockly from 'blockly';
import {TypedVariableModal} from '@blockly/plugin-typed-variable-modal';
//import {blocks} from './blocks/essence';
import {jsonBlocks} from './blocks/json';
import {essenceGenerator} from './blocks/automatedBlocks';
import {jsonGenerator} from './generators/json';
import {save, load} from './serialization';
import {jsonToolbox} from './jsonToolbox';
import './index.css';
import {essenceBlocks} from './blocks/automatedBlocks';
import { autoToolbox } from './blocks/automatedBlocks';

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(essenceBlocks);
Blockly.common.defineBlocks(jsonBlocks);

console.log(Blockly.constants.VariablesDynamic);
// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');
const dataDiv = document.getElementById("dataInputDiv");
const ws = Blockly.inject(blocklyDiv, {toolbox:autoToolbox});
const dataWS = Blockly.inject(dataDiv, {toolbox: jsonToolbox});

// adds start block to data input section
let startBlock = dataWS.newBlock("object");
startBlock.initSvg();
dataWS.render()

const blockOut = Blockly.inject(document.getElementById('blocklyDiv2'), {readOnly: true});

const createFlyout = function (ws) {
  let blockList = [];
  
  blockList.push({
    "kind": "button",
    "text": "create int_domain variable",
    "callbackKey": "int_callback"
  });

  blockList.push({
    "kind": "button",
    "text": "create bool_domain variable",
    "callbackKey": "bool_callback"
  });

  for (let v of ws.getVariablesOfType('int_domain')){
    blockList.push({
      'kind':'block',
      'type':'variables_get_integer',
      'fields': {
        'VAR': {
          "name": v.name,
          "type": "int_domain"
        }
      }
    })
  }

  for (let v of ws.getVariablesOfType('bool_domain')){
    blockList.push({
      'kind':'block',
      'type':'variables_get_bool',
      'fields': {
        'VAR': {
          "name": v.name,
          "type": "bool_domain"
        }
      }
    })
  }
  return blockList;

};

ws.registerToolboxCategoryCallback(
  'CREATE_TYPED_VARIABLE',
  createFlyout,
);

const int_button_callback = function () {
  Blockly.Variables.createVariableButtonHandler(ws, null, 'int_domain');
}
const bool_button_callback = function () {
  Blockly.Variables.createVariableButtonHandler(ws, null, 'bool_domain');
}
ws.registerButtonCallback('int_callback', int_button_callback);
ws.registerButtonCallback('bool_callback', bool_button_callback);


// adding variable category to data input WS
const createDataFlyout = function ()  {
  let xmlList = [];
  const blockList = Blockly.VariablesDynamic.flyoutCategoryBlocks(ws);
  xmlList = xmlList.concat(blockList);
   // adjust so forced to set variables by declarations.
  xmlList.splice(0,1);
  return xmlList;
};


dataWS.registerToolboxCategoryCallback(
  'GET_VARIABLE',
  createDataFlyout,
);

// generators for get variable blocks
essenceGenerator.forBlock['variables_get_integer'] = function(block) {
  var vars = block.getVars()
  const code = ws.getVariableById(vars[0]).name
  return [code, 0];
}
  
essenceGenerator.forBlock['variables_get_bool'] = function(block) {
  var vars = block.getVars()
  const code = ws.getVariableById(vars[0]).name
  return [code, 0];
}

jsonGenerator.forBlock['variables_get_dynamic'] = function(block) {
  var vars = block.getVars()
  const code = dataWS.getVariableById(vars[0]).name
  return [code, 0];
}
//add output button
var outputButton = document.createElement("BUTTON");
var outputButtonText = document.createTextNode("SOLVE");
outputButton.appendChild(outputButtonText);
outputDiv.append(outputButton);
outputButton.addEventListener("click", getSolution);

// add download button
var downloadButton = document.createElement("BUTTON");
var downloadButtonText = document.createTextNode("DOWNLOAD");
downloadButton.appendChild(downloadButtonText);
outputDiv.append(downloadButton);
downloadButton.addEventListener("click", downloadEssenceCode);

// add output text box 
var solutionText = document.createElement("Solution");
outputDiv.append(solutionText);



// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const runCode = () => {
  const code = essenceGenerator.workspaceToCode(ws);
  codeDiv.innerText = code;

  //outputDiv.innerHTML = '';

  //eval(code);
};

// Load the initial state from storage and run the code/.
//load(ws);
runCode();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});


// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()) {
    return;
  }
  runCode();
});

function printGeneratedCode(){
  console.log(essenceGenerator.workspaceToCode(ws));
}

// submits data and code to conjure
//from https://conjure-aas.cs.st-andrews.ac.uk/submitDemo.html
async function submit(inputData) {
  return new Promise((resolve, reject) => {
    fetch("https://conjure-aas.cs.st-andrews.ac.uk/submit", {
      method: 'POST', headers: {
          'Content-Type': 'application/json'
      }, body: JSON.stringify({
          appName: "conjure-blocks",
          solver: "kissat",
          model: essenceGenerator.workspaceToCode(ws)+"\n",
          data: inputData,
          conjureOptions: ["--number-of-solutions", "1"] // 1 is the default anyway
      })
    })
      .then(response => response.json())
      .then(json => resolve(json.jobid))
      .catch(err => reject(err))
  })}

// get conjure solution/ response
async function get(currentJobid) {
  return new Promise((resolve, reject) => {
    fetch("https://conjure-aas.cs.st-andrews.ac.uk/get", {
    method: 'POST', headers: {
      'Content-Type': 'application/json'

  }, body: JSON.stringify({
      appName: "conjure-blocks", 
      jobid: currentJobid
  })
  })
  .then(response => response.json())
  .then(json => resolve(json))
  .catch(err => reject(err))
  })
  
  
}

// Runs essence code in conjure, outputs solution logs
// from https://conjure-aas.cs.st-andrews.ac.uk/
async function getSolution() {
    solutionText.innerHTML = "Solving..."
    // gets the data from the data input workspace
    let data = jsonGenerator.workspaceToCode(dataWS);
    console.log("data " + data);
    let code = essenceGenerator.workspaceToCode(ws);
    console.log("code " + code);
    const client = new ConjureClient("conjure-blocks");
    client.solve(code, {data : data})
      .then(result => outputSolution(result));   
};

// outputs the solution in blocks, and outputs the log
function outputSolution(solution) {
  // make writable, so blocks line up nicely
  blockOut.options = new Blockly.Options({readOnly: false});
  solutionText.innerHTML = JSON.stringify(solution, undefined, 2);
  // clear any blocks from previous runs
  blockOut.clear();
  // if solved, create relevant blocks and add to output workspace
  if (solution.status == "ok"){
    for (let sol of solution.solution){
      for (let v in sol){
        blockOut.createVariable(v);
        let varBlock = blockOut.newBlock('variables_set');
        varBlock.setFieldValue(blockOut.getVariable(v).getId(), 'VAR');
        let valueBlock;
        switch (typeof(sol[v])){
          case("bigint"): 
          case("number"): {
              console.log("number");
              valueBlock = blockOut.newBlock('math_number');
              valueBlock.setFieldValue(sol[v], "NUM");
              break;
          }
          case("string"): {
            console.log("enum");
            valueBlock = blockOut.newBlock('text');
            valueBlock.setFieldValue(sol[v], "TEXT");
            break;
          }
          default:{
            console.log("idk");
            valueBlock = null;
            break;
          }

        };
        varBlock.getInput("VALUE").connection.connect(valueBlock.outputConnection);
        varBlock.initSvg();
        valueBlock.initSvg();
        blockOut.cleanUp();
        blockOut.render();
      }
    }    
    blockOut.options = new Blockly.Options({readOnly: true});
  }
 
}

// generate essence file from generated code
// This function adapted from https://blog.logrocket.com/programmatically-downloading-files-browser/#how-to-programmatically-download-file-html
// by Glad Chinda on LogRocket. Last accessed 27th February 2024.
function downloadEssenceCode() {
  // create file from the produced code.
  let filename = prompt("Please enter essence file name", "test");
  filename = filename + ".essence"
  let code = essenceGenerator.workspaceToCode(ws);
  let file = new File([code], filename);
  let url = URL.createObjectURL(file);
  const a = document.createElement("a");
  //sets download URL and download name.
  a.href = url;
  a.download = filename;

  // release URL when clicked
  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      removeEventListener('click', clickHandler);
    }, 150);
  };

  a.addEventListener('click', clickHandler, false);

  //automatic download
  a.click();
  
  document.body.appendChild(a)
}