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
    // drop down only if all strings - not sure how to handle cases where the $.x are args
    const options = [];
    for (let a of args){
        if (typeof(a) === "string") {
            options.push([a, a]);
        } else {
            return "dead";
        }
    }
    return {
        "message": "%1 ",
        "args": [{
            "type": "field_dropdown",
            "name": "OPTION",
            "options": options
        }]
    }
};

export const optional = function(arg) {
    // as optional, just return anyway
    return arg;
};

let prec = function(number, rule) {
    rule["prec"] = number;
    return rule;
}
    
prec.left = function (rule, number=0) {
        // ignoring as number precedence provided in grammar
        return rule
    };

prec.right = function (rule, number=0) {
        // ignoring as number precedence provided in grammar
        return rule
    };

export {prec};
    



