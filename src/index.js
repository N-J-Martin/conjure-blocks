/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
//import {blocks} from './blocks/text';
import {blocks} from './blocks/essence';
import {essenceGenerator} from './generators/essence';
import {save, load} from './serialization';
import {toolbox} from './toolbox';
import './index.css';

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);
//Object.assign(javascriptGenerator.forBlock, forBlock);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {toolbox});

//add output button
var outputButton = document.createElement("BUTTON");
var outputButtonText = document.createTextNode("hello");
outputButton.appendChild(outputButtonText);
outputDiv.append(outputButton);
outputButton.addEventListener("click", getSolution);

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

// Load the initial state from storage and run the code.
load(ws);
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

// from https://conjure-aas.cs.st-andrews.ac.uk/submitDemo.html
async function submit() {
  console.log(essenceGenerator.workspaceToCode(ws));
  return new Promise((resolve, reject) => {
    fetch("https://conjure-aas.cs.st-andrews.ac.uk/submit", {
      method: 'POST', headers: {
          'Content-Type': 'application/json'
      }, body: JSON.stringify({
          appName: "conjure-blocks", // so we know who is calling
          solver: "kissat", // this is optional
          model: essenceGenerator.workspaceToCode(ws)+"\n",
          // set up a space for this soon
          data:"{ \"n\": 2\n, \"m\": 7\n}\n",
           //document.getElementById('data').value,
          conjureOptions: ["--number-of-solutions", "1"] // 1 is the default anyway
      })
    })
      .then(response => response.json())
      .then(json => resolve(json.jobid))
      .catch(err => reject(err))
      //.then(json => {
          //console.log(json);
          //getSolution(json.jobid);
          //document.getElementById("output").innerHTML = JSON.stringify(json, undefined, 2);
          //document.getElementById("getDemoLink").href = 'getDemo.html#' + json['jobid'];
          //document.getElementById("getDemoLink").innerHTML = 'getDemo.html#' + json['jobid'];
      //})
  })}
 
async function get(currentJobid) {
  console.log(currentJobid);
  return new Promise((resolve, reject) => {
    fetch("https://conjure-aas.cs.st-andrews.ac.uk/get", {
    method: 'POST', headers: {
      'Content-Type': 'application/json'

  }, body: JSON.stringify({
      appName: "conjure-blocks", // so we know who is calling
      jobid: currentJobid
  })
  })
  .then(response => response.json())
  .then(json => resolve(json))
  .catch(err => reject(err))
  })
  
  
}

async function getSolution() {
    const currentJobid = await submit(); 
    //const solution = await get("add8a5e0-87cf-4e3e-baeb-f970aaeb5bd4");
    var solution = await get(currentJobid);
    while (solution.status == 'wait'){
      solution = await get(currentJobid);
    }
    console.log(solution);  
    solutionText.innerHTML = JSON.stringify(solution, undefined, 2);
}
