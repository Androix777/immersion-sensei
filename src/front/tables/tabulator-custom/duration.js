import { Duration } from "../../../../node_modules/luxon/build/es6/luxon.js";

export var durationEditor = function(cell, onRendered, success, cancel)
{
    let cellValue = convertToDuration(cell.getValue());
    let input = document.createElement("input");

    let currentValueIndex = 0
    let isChanging = false

    input.style.padding = "4px";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";

    input.value = cellValue;
    
    onRendered(function(){
        input.focus();
        input.style.height = "100%";
    });

    input.addEventListener("beforeinput", (event) =>
    {
        event.preventDefault();
        tryChangeValue(event.data, event.inputType)
        selectValueIndex(currentValueIndex)
    })

    input.addEventListener("focus", (event) =>
    {
        event.preventDefault();
        isChanging = false
        selectValueIndex(0)
    })

    input.addEventListener("compositionstart", (event) =>
    {
        input.blur();
        console.log("Tried to use IME")
    })

    input.addEventListener("mousedown", (event) =>
    {
        event.preventDefault();
        isChanging = false
        selectValueIndex(valueIndexByPosition(mousePositionInChars(event.layerX)))
    })

    input.addEventListener("blur", onChange);

    input.addEventListener("keydown", (event) =>
    {
        if(event.key == 'ArrowLeft')
        {
            event.preventDefault();
            isChanging = false
            selectValueIndex(currentValueIndex - 1)
        }

        if(event.key == 'ArrowRight')
        {
            event.preventDefault();
            isChanging = false
            selectValueIndex(currentValueIndex + 1)
        }

        if(event.key == 'Enter')
        {
            onChange();
        }

        if(event.key == 'Esc')
        {
            cancel();
        }
    });

    function onChange()
    {
        if(input.value != cellValue)
        {
            success(convertFromDuration(input.value));
        }
        else
        {
            cancel();
        }
    }

    function selectValueIndex(index)
    {
        let positions = getValuePositions()

        if(index < 0 || index > 2) return

        input.setSelectionRange(positions[index][0], positions[index][1])

        currentValueIndex = index
    }

    function getValuePositions()
    {
        var indexes = []
        var start = 0
        var end = 0
        var str = input.value

        var positions = []

        for(var i=0; i<str.length; i++) 
        {
            if (str[i] === ":") indexes.push(i);
        }
        
        if(indexes.length != 2)
        {
            return
        }

        for(var index = 0; index < 3; index++)
        {
            if(index == 0)
            {
                start = 0
            }
            else
            {
                start = indexes[index - 1] + 1
            }

            if(index == 2)
            {
                end = str.length
            }
            else
            {
                end = indexes[index]
            }
            positions.push([start, end])
        }
        
        return positions
    }

    function mousePositionInChars(layerX) 
    {
        var element_base_browser_styles = window.getComputedStyle(input);

        var add_char_pixal_lengths = 0

        var myStringArray = input.value.split("")
        var arrayLength = myStringArray.length;
        for (var i = 0; i <= arrayLength; i++) 
        {
            var get_char_value = getTextWidth(
                myStringArray[i],
                element_base_browser_styles.fontFamily +
                " " +
                element_base_browser_styles.fontSize
            );

            add_char_pixal_lengths =
            add_char_pixal_lengths + get_char_value + 1.311111111111;

            if (add_char_pixal_lengths > layerX) 
            {
                return i
            }
        }
        return 0

        function getTextWidth(text, font) 
        {
            // TODO: закэшировать канвас
            var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"))
            var context = canvas.getContext("2d")
            context.font = font
            var metrics = context.measureText(text)
            return metrics.width
        }
    }

    function valueIndexByPosition(position)
    {
        var valuesPositions = getValuePositions()
        for(let i = 0; i < 3; i++)
        {
            if(position <= valuesPositions[i][1]) return i
        }
        
    }

    function getCurrentValue()
    {
        let positions = getValuePositions()
        return parseInt(input.value.slice(positions[currentValueIndex][0], positions[currentValueIndex][1]))
    }


    function tryChangeValue(newValue, inputType)
    {
        var maxValues = [23, 59, 59]
        var newValue = parseInt(newValue)
        var currentValue = getCurrentValue()

        if(inputType != "insertText") return
        if(isNaN(newValue)) return
        if(newValue < 0 || newValue > 9) return

        
        if(isChanging)
        {
            let addedValue = currentValue * 10 + newValue
            if(addedValue > maxValues[currentValueIndex])
            {
                isChanging = false
                selectValueIndex(currentValueIndex + 1)
                tryChangeValue(newValue, inputType)
            }
            else
            {
                setValue(currentValueIndex, addedValue)
                if (addedValue * 10 > maxValues[currentValueIndex])
                {
                    isChanging = false
                    selectValueIndex(currentValueIndex + 1)
                }
            }
        }
        else
        {
            // добавить проверку на меньше 9
            setValue(currentValueIndex, newValue)
            if (newValue * 10 > maxValues[currentValueIndex] || newValue == 0)
            {
                isChanging = false
                selectValueIndex(currentValueIndex + 1)
            }
            else
            {
                isChanging = true
            }
        }
    }

    function setValue(index, value)
    {
        let positions = getValuePositions()
        input.value = input.value.slice(0, positions[index][0]) + value + input.value.slice(positions[index][1])
    }

    return input
}

export function durationFormatter(cell, formatterParams, onRendered)
{
    return convertToDuration(cell.getValue());
}

function convertToDuration(value)
{
    return Duration.fromObject({seconds:value}).toFormat('hh:mm:ss');
}

function convertFromDuration(value)
{
    var duration = value.match(/(\d+):(\d+):(\d+)/);
    return (Duration.fromObject({hours:duration[1], minutes:duration[2], seconds:duration[3]}).toMillis() / 1000)
}