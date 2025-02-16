export const seq = function(...args) {
    let argCount = 1;
    const argOut = [];
    let message = "";
    for (let a of args) {
        if (typeof(a) === "function") {
            message = message.concat("%"+argCount+" ");
            argOut.push({
                "type": "input_value",
                "name":"TEMP"+argCount
            })
            argCount ++;
        } else if (typeof(a) === "object" && a.constructor.name != "RegExp") {
            // merge 2 block JSON together.
            const addedArgs = a.args;
            let addedMessage = a.message;
            for (let i = 0; i < addedArgs.length; i++){
                addedMessage = addedMessage.replace("%"+(i+1), "%"+argCount);
                const newArg = addedArgs[i];
                newArg.name = "TEMP"+argCount;
                argOut.push(newArg);
                argCount++;
            }
            message = message.concat(addedMessage + " ");
        } else {
            message = message.concat(a + " ");
        }
    }
    
    return {"message" : message.trimEnd(),
        "args": argOut};
};

export const repeat = function(arg) {
    // add list slot
    const message = "%1 ";
    const args = [{
        "type":"input_value",
        "name":"TEMP1",
        "check":"Array"
    }]
    return {message, args}
};

export const choice = function(...args) {
    return "choice called"
};

export const optional = function(arg) {
    // as optional, just return anyway
    return arg;
};


export const prec = function(number, rule) {
    return "prec called"
};

prec.left = function(...args) {
    return "prec left called"
};

prec.right = function(...args) {
    return "prec right called"
};

