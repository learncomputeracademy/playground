// script.js
document.addEventListener('DOMContentLoaded', () => {
    const units = {
        length: {
            'Meter': 1,
            'Kilometer': 1000,
            'Centimeter': 0.01,
            'Millimeter': 0.001,
            'Mile': 1609.34,
            'Yard': 0.9144,
            'Foot': 0.3048,
            'Inch': 0.0254
        },
        'weight': {
            'Kilogram': 1,
            'Gram': 0.001,
            'Milligram': 0.000001,
            'Pound': 0.453592,
            'Ounce': 0.0283495
        },
        temperature: {
            'Celsius': 'c',
            'Fahrenheit': 'f',
            'Kelvin': 'k'
        },
        volume: {
            'Liter': 1,
            'Milliliter': 0.001,
            'Gallon (US)': 3.78541,
            'Quart (US)': 0.946353,
            'Pint (US)': 0.473176,
            'Cup (US)': 0.24
        }
    };

    const modeSelect = document.getElementById('modeSelect');
    const fromUnitSelect = document.getElementById('fromUnit');
    const toUnitSelect = document.getElementById('toUnit');
    const inputValue = document.getElementById('inputValue');
    const resultValue = document.getElementById('resultValue');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistory');

    let history = JSON.parse(localStorage.getItem('conversionHistory')) || [];

    function populateUnits(category) {
        const unitOptions = units[category];
        fromUnitSelect.innerHTML = '';
        toUnitSelect.innerHTML = '';

        for (let unit in unitOptions) {
            const option1 = document.createElement('option');
            const option2 = document.createElement('option');
            option1.value = unit;
            option2.value = unit;
            option1.textContent = unit;
            option2.textContent = unit;
            fromUnitSelect.appendChild(option1);
            toUnitSelect.appendChild(option2);
        }
        // Set default selections like Windows Calculator
        fromUnitSelect.selectedIndex = 0;
        toUnitSelect.selectedIndex = 1;
    }

    function convertTemperature(value, fromUnit, toUnit) {
        let celsius;
        switch(fromUnit) {
            case 'Celsius': celsius = value; break;
            case 'Fahrenheit': celsius = (value - 32) * 5/9; break;
            case 'Kelvin': celsius = value - 273.15; break;
        }
        switch(toUnit) {
            case 'Celsius': return celsius;
            case 'Fahrenheit': return (celsius * 9/5) + 32;
            case 'Kelvin': return celsius + 273.15;
        }
    }

    function convert() {
        const category = modeSelect.value;
        const fromUnit = fromUnitSelect.value;
        const toUnit = toUnitSelect.value;
        const value = parseFloat(inputValue.value) || 0;

        let result;
        if (category === 'temperature') {
            result = convertTemperature(value, fromUnit, toUnit);
        } else {
            const fromFactor = units[category][fromUnit];
            const toFactor = units[category][toUnit];
            result = (value * fromFactor) / toFactor;
        }

        resultValue.value = result.toFixed(6).replace(/\.?0+$/, '');

        if (value !== 0) {
            const conversion = {
                date: new Date().toLocaleTimeString(),
                value: value,
                fromUnit: fromUnit,
                toUnit: toUnit,
                result: result.toFixed(6).replace(/\.?0+$/, ''),
                category: category
            };
            history.unshift(conversion);
            if (history.length > 10) history.pop();
            localStorage.setItem('conversionHistory', JSON.stringify(history));
            updateHistory();
        }
    }

    function updateHistory() {
        historyList.innerHTML = '';
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `${item.value} ${item.fromUnit} = ${item.result} ${item.toUnit}<br><span>${item.date}</span>`;
            historyList.appendChild(div);
        });
    }

    function clearHistory() {
        history = [];
        localStorage.removeItem('conversionHistory');
        updateHistory();
    }

    modeSelect.addEventListener('change', () => {
        populateUnits(modeSelect.value);
        convert();
    });

    fromUnitSelect.addEventListener('change', convert);
    toUnitSelect.addEventListener('change', convert);
    inputValue.addEventListener('input', convert);
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Initial setup
    populateUnits(modeSelect.value);
    updateHistory();
});