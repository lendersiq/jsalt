// Custom function to parse CSV content
function parseCSV(csvContent, callback) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) continue; // Skip invalid rows

    const row = {};
    headers.forEach((header, index) => {
      let value = values[index].trim();
      // Convert to number if applicable
      if (!isNaN(value)) value = parseFloat(value);
      row[header] = value;
    });
    data.push(row);
  }

  callback(data);
}

// Synonym library to map common synonyms to their respective headers
const synonymLibrary = {
  'fee': ['charge', 'cost', 'duty', 'collection', 'levy'],
  'open': ['origination', 'start', 'create', 'establish', 'setup']
};

// AI translation function to map formula fields to CSV headers
function aiTranslater(headers, field) {
  function stem(word) {
    return word
      .replace(/(ing|ed|ly)$/i, '')  // Remove common suffixes like 'ing', 'ed', 'ly'
      .replace(/(es)$/i, 'e')        // Handle plural forms like 'fees' -> 'fee', and 'boxes' -> 'box'
      .replace(/(s)$/i, '')          // Handle remaining singular forms like 'cats' -> 'cat'
      .replace(/(er|est)$/i, '')     // Remove comparative and superlative endings like 'er', 'est'
      .trim();
  }
  const headersLower = headers.map(header => stem(header.toLowerCase()));
  const stemmedField = stem(field.toLowerCase());
  // First, try to find a direct match
  let matchingHeader = headersLower.find(header => header.includes(stemmedField));
  // If no direct match, check the synonym library
  if (!matchingHeader && synonymLibrary[stemmedField]) {
    const synonyms = synonymLibrary[stemmedField].map(synonym => stem(synonym));
    matchingHeader = headersLower.find(header => 
      synonyms.some(synonym => header.includes(synonym))
    );
  }

  return matchingHeader ? headers[headersLower.indexOf(matchingHeader)] : null;
}

// Test the aiTranslater function
const headers = ['Portfolio', 'Date_Opened', 'Maturity_Date', 'Branch_Number', 'Class_Code', 'Opened_by_Resp_Code', 'Late_Charges'];
const translatedHeader = aiTranslater(headers, 'fees');
console.log('Translated Header:', translatedHeader);


// Function to extract unique source names from the formula
function extractSources(formula) {
  const sourceSet = new Set();
  const regex = /(\w+)\.(\w+)/g;
  let match;
  while ((match = regex.exec(formula)) !== null) {
    sourceSet.add(match[1]);
  }
  return Array.from(sourceSet);
}

function processFormula(identifiedSources, formula, uniqueKey, csvData) {
  const results = {};

  // Get today's date
  const today = new Date();

  console.log('Starting formula processing...');
  console.log('Identified Sources:', identifiedSources);
  console.log('Formula:', formula);
  console.log('Unique Key:', uniqueKey);
  console.log('CSV Data:', csvData);

  // Iterate over each source's data to ensure flexibility with multiple sources
  identifiedSources.forEach(sourceName => {
    const sourceData = csvData[sourceName];
    console.log(`Processing source: ${sourceName}`);
    console.log('Source Data:', sourceData);

    sourceData.forEach(row => {
      const uniqueId = row[uniqueKey];
      console.log('Processing row:', row);
      //console.log('Unique ID:', uniqueId);

      // Translate the formula by replacing source.field with actual data and executing functions
      const translatedFormula = formula.replace(/(\w+)\.(\w+)/g, (match, source, field) => {
        console.log('Match found:', match);
        console.log('Source:', source, 'Field:', field);

        // Handle normal field data or potential function calls
        let headers = Object.keys(row);
        let translatedHeader = aiTranslater(headers, field);

        // Check if this match is a function call in the libraries object
        for (const libName in window.libraries) {
          const lib = window.libraries[libName];

          if (lib.functions[field] && typeof lib.functions[field].implementation === 'function') {
            const functionDef = lib.functions[field];
            //console.log(`Function detected in library '${libName}': ${field}`);

            // Extract parameter values required by the function, removing default values
            const paramNames = functionDef.implementation
              .toString()
              .match(/\(([^)]*)\)/)[1]
              .split(',')
              .map(param => param.split('=')[0].trim()); // Remove default values like '= null'
            //console.log('Function Parameter Names:', paramNames);

            // Retrieve parameter values from the CSV data
            const args = paramNames.map(paramName => {
              const paramHeader = aiTranslater(headers, paramName); // Translate param to CSV header
              if (paramHeader) {
                const paramValue = row[paramHeader];
                //console.log(`pre date detect:  Parameter: ${paramName}, Value: ${paramValue}`);
                if (isDate(paramValue)) {
                  //console.log(`Date Parameter: ${paramName}, Value: ${paramValue}`);
                  return new Date(paramValue); // Return date as Date object
                } else if (typeof paramValue === "string") {
                  return paramValue.trim();
                } else {
                  //console.log(`Numeric Parameter: ${paramName}, Value: ${paramValue}`);
                  return parseFloat(paramValue); // Get numeric value from CSV
                }
              }
              return null; // Use null for missing optional parameters
            });

            // Execute the function with the extracted parameters
            const result = functionDef.implementation(...args);
            console.log('Function result:', result);
            return result;
          }
        }

        // Handle normal field data if no function is detected
        if (translatedHeader) {
          const value = row[translatedHeader];
          console.log('Field Value:', value);

          // Check if the field is a date and calculate the difference in days
          if (isDate(value)) {
            const dateValue = new Date(value);
            const differenceInTime = today - dateValue;
            const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
            console.log('Date Difference:', differenceInDays);
            return differenceInDays; // Return the difference in days
          } else {
            return `${parseFloat(value)}`; // Return the numeric value as a string
          }
        }
        return '0'; // Default to zero if no matching data
      });

      console.log('Translated Formula:', translatedFormula);

      // Evaluate the translated formula
      try {
        const formulaFunction = new Function(`return (${translatedFormula});`);
        const result = formulaFunction();
        console.log('Formula Evaluation Result:', result);

        // Store the evaluation result by unique identifier
        if (result !== null) { // Only store non-null results
          if (!results[uniqueId]) {
            results[uniqueId] = { result: 0, count: 0 }; // Initialize if not present
          }
          results[uniqueId]['result'] += result; // Increment the result
          results[uniqueId]['count'] += 1; // Increment the count

          // Populate other fields based on the presentation configuration
          if (appConfig.presentation && appConfig.presentation.columns) {
            appConfig.presentation.columns.forEach(column => {
              const headers = Object.keys(row);
              const translatedColumn = aiTranslater(headers, column.field);
              if (translatedColumn) {
                if (results[uniqueId][column.field] !== undefined) {
                  results[uniqueId][column.field] = `${results[uniqueId][column.field]}, ${row[translatedColumn]}`; 
                } else if (row[translatedColumn]) {
                  results[uniqueId][column.field] = row[translatedColumn];
                }
              }
            });
          }
        }
      } catch (error) {
        console.error('Error evaluating formula:', error);
      }
    });
  });

  console.log('Final Results:', results);
  return results; // Return the final results object containing all evaluated results
}


// Helper function to check if a value is a valid date
function isDate(value) {
  return !isNaN(Date.parse(value)) && isNaN(value);
}

function getFilenameWithoutExtension(url) {
  const urlObject = new URL(url);
  const pathname = urlObject.pathname;

  // Remove trailing slash if present
  const trimmedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  const filename = trimmedPathname.substring(trimmedPathname.lastIndexOf('/') + 1);
  const filenameWithoutExtension = filename.split('.').slice(0, -1).join('.') || filename;

  console.log('filenameWithoutExtension', filenameWithoutExtension);
  return filenameWithoutExtension;
}

function loadLibraryScripts(filePaths, callback) {
  console.log('filePaths', filePaths);
  // Initialize a global libraries object to store all exports
  window.libraries = {};
  let loadedScripts = 0;

  // Callback function to handle each script load
  function scriptLoaded() {
    loadedScripts += 1;
    if (loadedScripts === filePaths.length && typeof callback === 'function') {
      callback();
    }
  }

  // Iterate over each file path to create and load script elements
  filePaths.forEach(filePath => {
    if (typeof filePath === 'string' && (filePath.startsWith('http://') || filePath.startsWith('https://'))) {
      // Handle API URL
      fetch(filePath)
        .then(response => response.json())
        .then(data => {
          const libName = getFilenameWithoutExtension(filePath); // Use the new function
          window.libraries.api = window.libraries.api || {};
          window.libraries.api[libName] = data;
          console.log(`API library '${libName}' loaded:`, data);
          scriptLoaded();
        })
        .catch(error => {
          console.error(`Failed to load API from ${filePath}:`, error);
          scriptLoaded(); // Still call the callback to continue the process
        });
    } else {
      // Handle local JS file
      const script = document.createElement('script');
      script.src = '../libraries/' + filePath + '.js';
      script.type = 'text/javascript';
      script.async = false; // Ensure scripts are loaded in order

      script.onload = function() {
        const libName = filePath.split('/').pop().replace('.js', ''); // Extract the name without extension
        if (window[libName]) {
          window.libraries[libName] = window[libName];
        }
        scriptLoaded();
      };

      script.onerror = (e) => {
        console.error(`Failed to load script: ${filePath}`, e);
        scriptLoaded();
      };

      document.head.appendChild(script);
    }
  });
}

if (appConfig && appConfig.libraries) {
  // Load the specified library files
  loadLibraryScripts(appConfig.libraries, () => {
    console.log('All libraries loaded:', window.libraries);

    // Example usage: Call a function from the loaded libraries
    if (window.libraries.financial && window.libraries.financial.functions.interestIncome) {
      const result = window.libraries.financial.functions.interestIncome.implementation(1000, 0.05);
      console.log('Interest Income Result:', result);
    }
  });
} else {
  console.warn('no libraries defined')
}

window.readFilesAndProcess = function(fileInputs, identifiedSources, appConfig) {
  const csvData = {};
  const promises = identifiedSources.map(sourceName => {
    return new Promise((resolve, reject) => {
      const input = fileInputs[sourceName];
      if (input.files.length > 0) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
          parseCSV(event.target.result, (data) => {
            csvData[sourceName] = data;
            resolve();
          });
        };
        reader.onerror = function() {
          reject(new Error(`Failed to read file for ${sourceName}`));
        };
        reader.readAsText(file);
      } else {
        reject(new Error(`No file selected for ${sourceName}`));
      }
    });
  });

  // Show the spinner before starting the promise
  showSpinner();

  Promise.all(promises)
    .then(() => {
      window.analytics = computeAnalytics(csvData);
      console.log('Analytics:', window.analytics);
      combinedResults = processFormula(identifiedSources, appConfig.formula, appConfig.unique, csvData);
      displayResultsInTable(combinedResults);
    })
    .catch(error => {
      console.error('Error processing files:', error);
      alert('Error processing files. Please ensure all files are selected and valid.');
    })
    .finally(() => {
      // Hide the spinner after processing
      hideSpinner();
      document.getElementById('chart-container').style.display = 'block';
    });
};

// Function to hide the spinner
function hideSpinner() {
  const spinner = document.getElementById('spinner-container');
  if (spinner) {
    spinner.style.display = 'none';
  }
}

function yearToDateFactor(fieldName) {
  let factor = 1; // default to 1
  const lowerStr = fieldName.toLowerCase();
  if (lowerStr.includes("mtd")) {
    factor = 12;
  } else if (lowerStr.includes("day") || lowerStr.includes("daily")) {
    factor = 365
  }
  return factor;
} 

function computeAnalytics(csvData) {
  console.log('csvData @ computeAnalytics', csvData)
  const analytics = {};

  Object.keys(csvData).forEach(sourceName => {
    const sourceData = csvData[sourceName];
    const fieldAnalytics = {};

    // Identify numeric fields by checking if all non-null values in the field are numeric
    const numericFields = Object.keys(sourceData[0]).filter(field => {
      const isDateField = sourceData.some(row => isDate(row[field]));
      const isNumericField = sourceData.every(row => isNumericOrStartsWithNumeric(row[field]));
      console.log(`Field: ${field}, Is Numeric: ${isNumericField}, Is Date: ${isDateField}`);
      return isNumericField && !isDateField;
    });

    numericFields.forEach(field => {
      const validValues = sourceData
        .map(row => convertToNumeric(row[field]))
        .filter(value => value !== null && !isNaN(value)); // Filter out null and NaN values
      if (validValues.length > 0) {
        fieldAnalytics[field] = {
          min: Math.min(...validValues),
          max: Math.max(...validValues),
          mean: mean(validValues),
          median: median(validValues),
          mode: mode(validValues),
          variance: variance(validValues),
          stdDeviation: stdDeviation(validValues),
          sum: sum(validValues),
          count: validValues.length, 
          unique : uniqueValues(validValues)
        };
        fieldAnalytics[field].YTDfactor = yearToDateFactor(field);
        if (fieldAnalytics[field].unique > 4 && fieldAnalytics[field].unique <= 16  && parseInt(fieldAnalytics[field].median) < fieldAnalytics[field].unique-1 ) {
          fieldAnalytics[field].uniqueArray = [...new Set(validValues)];
          fieldAnalytics[field].convexProbability = createProbabilityArray(fieldAnalytics[field].mode, fieldAnalytics[field].unique, fieldAnalytics[field].uniqueArray);
        }
      }
    });
    analytics[sourceName] = fieldAnalytics;
  });

  console.log('Computed Analytics:', analytics);
  return analytics;
}

// Helper function to check if a value is numeric or starts with a numeric
function isNumericOrStartsWithNumeric(value) {
  let testValue = value;
  if (testValue === null || isNaN(testValue)) return true;  // 'null' in a numeric field is acceptable
  if (typeof testValue === 'string') {
    testValue = testValue.trim(); // Trim leading and trailing spaces if it's a string
    if (testValue.toLowerCase() === 'null' || /^[0-9][a-zA-Z]$/.test(testValue)) return true; // Explicitly check for 'NULL' or NumChar after trimming
    testValue = Number(testValue);
  }
  // Return true if the value starts with a digit or is a number
   const isNumericOrStartsIntChar = !isNaN(testValue) || (typeof testValue === 'string' && /^\d/.test(testValue));
   if (!isNumericOrStartsIntChar) {
      console.log('numeric false', value)
   }
   return isNumericOrStartsIntChar
}

// Helper function to convert values like "3W" to a numeric value (e.g., 3.5)
function convertToNumeric(value) {
  if (value === null) return null; // Return null for null values
  if (typeof value === 'string') {
    value = value.trim(); // Trim leading and trailing spaces if it's a string
    if (value.toLowerCase() === 'null') return null; // Return null for 'NULL' strings
    if (/^\d/.test(value)) {
      const numericPart = parseFloat(value.match(/^\d+/)[0]);
      return numericPart + (value.length === 1 ? 0 : 0.5); // Add .5 if the string contains a letter after the digit
    }
  }
  if (!isNaN(value)) return parseFloat(value); // Directly return numeric values
  return null; // Return null for non-numeric values
}

// Helper function to check if a value is a valid date
function isDate(value) {
  return !isNaN(Date.parse(value)) && isNaN(value);
}

// Helper functions for computing statistics (as previously defined)
function mean(values) {
  return sum(values) / values.length;
}

function median(values) {
  values.sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  return values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
}

function mode(values) {
  const frequencyMap = {};
  let maxFreq = 0;
  let mode = [];

  // Create a frequency map
  values.forEach(value => {
    if (frequencyMap[value]) {
      frequencyMap[value]++;
    } else {
      frequencyMap[value] = 1;
    }
    if (frequencyMap[value] > maxFreq) {
      maxFreq = frequencyMap[value];
    }
  });

  // Find the mode(s)
  for (const key in frequencyMap) {
    if (frequencyMap[key] === maxFreq) {
      mode.push(Number(key));
    }
  }

  // If there's a single mode, return it, otherwise return an array of modes
  return mode.length === 1 ? mode[0] : mode;
}

function variance(values) {
  const m = mean(values);
  return mean(values.map(v => (v - m) ** 2));
}

function stdDeviation(values) {
  return Math.sqrt(variance(values));
}

function sum(values) {
  return values.reduce((acc, val) => acc + val, 0);
}

function uniqueValues(values) {
  const uniqueValues = new Set(values);
  return uniqueValues.size
}

function createProbabilityArray(mode, unique, uniqueArray) {
  //unique is quantity of unique values in a column, and uniqueArray contains all unique values
  /* Convexity in Risk Model applied here refers to the situation where the rate of probability becomes steeper as the value increases. 
  In other words, the relationship between value and probability is convex, 
  meaning that beyond the mode (value that appears most frequently in a data set which is the tipping point) small increases in value can lead to disproportionately large increases in the likelihood of an event (i.e., a loss).
  */
  mode = parseInt(mode);
  // Function to interpolate between two values over a number of steps
  function interpolate(startValue, endValue, steps) {
      const stepValue = (endValue - startValue) / (steps - 1);  
      const values = [];
      for (let i = 0; i < steps; i++) {
          values.push(startValue + i * stepValue);
      }
      return values;
  }
  // Generate arrays with the specified unique size
  let probabilityArray = [];
  // Interpolate between probabilityArray[0] and probabilityArray[median-1]
  const firstSegment = interpolate(0, 1, mode);
  // Interpolate between probabilityArray[median] and probabilityArray[unique-1]
  const secondSegment = interpolate(5, 100, unique - mode);
  console.log(`median: ${mode}, unique: ${unique}, firstSegment: ${firstSegment}, secondSegment : ${secondSegment}`)

  // Assign values to the first probability array
  for (let i = 0; i < firstSegment.length; i++) {
      probabilityArray[`'${uniqueArray[i]}'`] = parseFloat(firstSegment[i].toFixed(2));
  }
  for (let i = 0; i < secondSegment.length; i++) {
      probabilityArray[`'${uniqueArray[mode + i]}'`] = parseFloat(secondSegment[i].toFixed(2));
  }
  return probabilityArray;
}
