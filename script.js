// Global Variables
let criteria = [];
let pairwiseComparison = [];

// Function to add criteria
function addCriteria() {
  const criteriaInput = document.getElementById("criteria-input");
  const criteriaName = criteriaInput.value.trim();

  if (criteriaName !== "") {
    criteria.push(criteriaName);
    criteriaInput.value = "";

    displayChosenCriteria();
    displayPairwiseComparison();
  }
}

// Function to display chosen criteria
function displayChosenCriteria() {
  const chosenCriteriaDiv = document.getElementById("chosen-criteria");
  chosenCriteriaDiv.innerHTML = "";

  for (let i = 0; i < criteria.length; i++) {
    const criteriaItem = document.createElement("div");
    criteriaItem.textContent = criteria[i];

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
      deleteCriteria(i);
    });

    criteriaItem.appendChild(deleteButton);
    chosenCriteriaDiv.appendChild(criteriaItem);
  }
}

// Function to delete criteria
function deleteCriteria(index) {
  criteria.splice(index, 1);

  displayChosenCriteria();
  displayPairwiseComparison();
}

// Function to display pairwise comparison table
function displayPairwiseComparison() {
  const comparisonTable = document.getElementById("comparison-table");
  comparisonTable.innerHTML = "";

  const numRows = criteria.length;
  const headerRow = document.createElement("tr");

  for (let i = 0; i < numRows + 1; i++) {
    const headerCell = document.createElement("th");
    headerCell.textContent = i === 0 ? "Criteria" : criteria[i - 1];
    headerRow.appendChild(headerCell);
  }

  comparisonTable.appendChild(headerRow);

  for (let i = 0; i < numRows; i++) {
    const row = document.createElement("tr");

    for (let j = 0; j < numRows + 1; j++) {
      const cell = document.createElement("td");

      if (j === 0) {
        cell.textContent = criteria[i];
        cell.style.fontWeight = "bold";
      } else {
        const input = document.createElement("input");
        input.type = "number";
        input.min = 1;
        input.max = 9;
        input.value = j === i + 1 ? 1 : "";

        input.addEventListener("change", function (ba) {
            // try{
                // input.value =input.value+1
                console.log(input.value)
                updatePairwiseComparison(i, j - 1, parseFloat(input.value));
                
            // }catch{}
            // console.log("i ==", i, ",  j==",j)
            // console.log(document.getElementById("comparison-table")
            // .rows[j-1].cells[i+1].children[0].value)
            // document.getElementById("comparison-table")
            // .rows[j+1].cells[i-1].children[0].value=1/input.value
        });

        cell.appendChild(input);
        
      }

      row.appendChild(cell);
    }

    comparisonTable.appendChild(row);
  }
}

// Function to update pairwise comparison
function updatePairwiseComparison(row, col, value) {
    const intValue = parseFloat(value); // Convert to integer

    pairwiseComparison[row][col] = intValue;
    pairwiseComparison[col][row] = 1 / intValue;
  
    // Update the input values
    const comparisonTable = document.getElementById("comparison-table");
    const input1 = comparisonTable.rows[row + 1].cells[col + 1].children[0];
    const input2 = comparisonTable.rows[col + 1].cells[row + 1].children[0];
  
    input1.value = intValue;
    input2.value = 1 / intValue;
}

// Function to calculate priority weights
function calculateWeights() {
  const numCriteria = criteria.length;
  pairwiseComparison = [];

  for (let i = 0; i < numCriteria; i++) {
    pairwiseComparison[i] = [];

    for (let j = 0; j < numCriteria; j++) {
      pairwiseComparison[i][j] = parseFloat(
        document
          .getElementById("comparison-table")
          .rows[i + 1].cells[j + 1].children[0].value
      );
    }
  }

  const weights = calculatePriorityWeights(pairwiseComparison);

  displayWeights(weights);
}

// Function to calculate priority weights
function calculatePriorityWeights(pairwiseComparison) {
  const numCriteria = pairwiseComparison.length;
  const weights = [];

  for (let i = 0; i < numCriteria; i++) {
    let product = 1;

    for (let j = 0; j < numCriteria; j++) {
      product *= pairwiseComparison[i][j];
    }

    const weight = Math.pow(product, 1 / numCriteria);
    weights.push(weight);
  }

  const sumWeights = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map((weight) => weight / sumWeights);
}

// Function to display priority weights
function displayWeights(weights) {
  const weightsTable = document.getElementById("weights-table");
  weightsTable.innerHTML = "";

  for (let i = 0; i < criteria.length; i++) {
    const row = document.createElement("tr");

    const criteriaCell = document.createElement("td");
    criteriaCell.textContent = criteria[i];
    row.appendChild(criteriaCell);

    const weightCell = document.createElement("td");
    weightCell.textContent = weights[i].toFixed(4);
    row.appendChild(weightCell);

    weightsTable.appendChild(row);
  }
}

// Function to check consistency
function checkConsistency() {
  const consistencyRatio = calculateConsistencyRatio(pairwiseComparison);

  if (consistencyRatio <= 0.1) {
    showConsistencyResult(true);
  } else {
    showConsistencyResult(false);
  }
}

// Function to calculate consistency ratio
function calculateConsistencyRatio(pairwiseComparison) {
  const numCriteria = pairwiseComparison.length;
  const weights = calculatePriorityWeights(pairwiseComparison);

  let lambdaMax = 0;

  for (let i = 0; i < numCriteria; i++) {
    let rowSum = 0;

    for (let j = 0; j < numCriteria; j++) {
      rowSum += pairwiseComparison[i][j];
    }

    lambdaMax += rowSum * weights[i];
  }

  const consistencyIndex = (lambdaMax - numCriteria) / (numCriteria - 1);
  const consistencyRatio = consistencyIndex / getRI(numCriteria);

  return consistencyRatio;
}

// Function to get random index (RI) for consistency check
function getRI(numCriteria) {
  // RI values for different matrix sizes
  const riValues = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];

  return riValues[numCriteria];
}

// Function to show consistency result
function showConsistencyResult(isConsistent) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";

  const message = document.createElement("p");
  message.textContent = isConsistent ? "Consistency Check Passed!" : "Inconsistent Comparison Matrix";
  message.style.color = isConsistent ? "green" : "red";

  resultDiv.appendChild(message);
}

// Function to show AHP decision result
function showResult(result) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";

  const table = document.createElement("table");
  table.classList.add("result-table");

  // Populate the table with the AHP decision result
  // ...

  resultDiv.appendChild(table);
}

// Call any necessary initialization functions here
displayChosenCriteria();
displayPairwiseComparison();
