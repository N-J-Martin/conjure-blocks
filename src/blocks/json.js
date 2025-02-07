// A variation of code from https://blocklycodelabs.dev/codelabs/custom-generator/index.html?index=..%2F..index#0
// JSON blocks also needed, not necessarily Essence blocks
import * as Blockly from 'blockly';

export const jsonBlocks = Blockly.common.createBlockDefinitionsFromJsonArray([{
    "type": "object",
    "message0": "{ %1 %2 }",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "MEMBERS"
      }
    ],
    "output": null,
    "colour": 230,
  },
  {
    "type": "member",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "MEMBER_NAME",
      },
      {
        "type": "field_label",
        "name": "COLON",
        "text": ":"
      },
      {
        "type": "input_value",
        "name": "MEMBER_VALUE"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "inputsInline": true
  }]);