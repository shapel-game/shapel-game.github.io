import { allWordsList, dailyWordsList } from "./words.js"
import { letterShapeCodes, letterShapes } from "./letter_shapes.js"

//Add a trigger for when the document has finished loading.
document.addEventListener("DOMContentLoaded", () => {
    var pageName = (window.location.pathname).split("/").pop();
    pageName = pageName.split(".html")[0];
    console.log(pageName);

    //Get a list of keys (buttons within an element with the 'keyboard-row' class)
    const keys = document.querySelectorAll('.keyboard-row button')
    
    const codeDict = {}
    let word = "shapel";
    let wordShape = "shspsh";

    const numLetters = 6;
    let numGuesses = 3;
    let mustBeWord = false;
    let randomWord = false;
    let saveLoadScore = true;
    let saveLoadGuesses = true;
    let showCorrect = false;
    let printShapeDistributions = false;

    let totalScore = 0;
    let numGames = 0;
    let numWins = 0;
    let points = 0;
    let matchingWords = [];

    let guessedLetters = [[]]
    let keyboardCorrectness = []
    let nextSpace = 1;
    let guessedWordCount = 0;

    let gameFinished = false;
    let loading = false;
    const dayIndex = getDay();

    if (pageName == "shapel-random.html" || pageName == "shapel-random") {
        randomWord = true;
        saveLoadGuesses = false;
    }

    setupKeys();
    setupInfoBox();
    chooseWord();
    createLetterSlots();

    setupLetters();
    loadData();

    function chooseWord() {
        analyseWords();

        if (randomWord) {
            const randIndex = Math.floor(Math.random() * allWordsList.length);
            word = allWordsList[randIndex];
        }
        else {
            //const day = getDay();
            word = dailyWordsList[dayIndex];
        }
        wordShape = wordCode(word);
        //console.log(word);
        const message = `There are at least ${codeDict[wordShape].length} words with this shape.`;
        //console.log(message)
        const wordStats = document.getElementById("word-stats");
        wordStats.textContent = message;
        
        matchingWords = "";
        for (let match of codeDict[wordShape]) {
            matchingWords += match + ", ";
        }
        //console.log(matchingWords);
    }

    function setupLetters()
    {
        for (let i = 0; i < 26; i++) {
            keyboardCorrectness.push("None");
        }
    }

    function wordCode(word) {
        let wordCode = "";
        for (const letter of word) {
            wordCode += letterCode(letter);
        }
        return wordCode;
    }

    function analyseWords()
    {
        for (const word of allWordsList) {
            let code = wordCode(word);
            if (codeDict[code] === undefined) {
                codeDict[code] = [];
            }
            codeDict[code].push(word);
        }

        if (printShapeDistributions) {
            for (const key of Object.keys(codeDict)) {
                //console.log(`${key}= ${codeDict[key].length} ${codeDict[key]}`);
                console.log(`${codeDict[key].length}: ${codeDict[key]}`);
            }
        }
    }

    function getDay() {
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 0);
        var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        var oneDay = 1000 * 60 * 60 * 24;
        var day = Math.floor(diff / oneDay);
        return day;
    }
    
    function loadData() {
        if (saveLoadScore) {
            totalScore = loadValue("totalScore");
            numGames = loadValue("numGames");
            numWins = loadValue("numWins");
        }
        let saveDay = loadValue("saveDate");
        if (saveLoadGuesses && (saveDay === dayIndex || randomWord)) {
            let prevGuessesString = loadString("prevGuesses");
            if (prevGuessesString === 0) {
                return;
            }
            
            let prevGuesses = prevGuessesString.split(",");
            loading = true;
            for (let i = 0; i < prevGuesses.length; i++) {
                let prevGuess = prevGuesses[i].split('');
                for (let j = 0; j < prevGuess.length; j++) {
                    updateGuessedWords(prevGuess[j]);
                }
                handleSubmitWord();
            }
            loading = false;
        }
    }
    
    function setValue(name, value) {
        let modeName = pageName + ": " + name;
        let newValue = parseInt(value);
        localStorage.setItem(modeName, newValue);
        return newValue;
    }
    
    function updateValue(name, change) {
        let modeName = pageName + ": " + name;
        let newValue = parseInt(localStorage.getItem(modeName)) + change;
        localStorage.setItem(modeName, newValue);
        return newValue;
    }

    function loadValue(name) {
        let modeName = pageName + ": " + name;
        if (localStorage.getItem(modeName) === null) {
            localStorage.setItem(modeName, 0);
            return 0;
        }
        else {
            return parseInt(localStorage.getItem(modeName));
        }
    }
    
    function setString(name, value) {
        let modeName = pageName + ": " + name;
        localStorage.setItem(modeName, value);
        return value;
    }

    function loadString(name) {
        let modeName = pageName + ": " + name;
        if (localStorage.getItem(modeName) === null) {
            localStorage.setItem(modeName, 0);
            return 0;
        }
        else {
            return localStorage.getItem(modeName);
        }
    }

    function letterIndex(letter) {
        return (letter.charCodeAt(0) - 97);
    }

    function letterShape(letter) {
        return letterShapes[letter];
    }

    function letterCode(letter) {
        return letterShapeCodes[letter];
    }

    //Get the array of the current word (e.g. array of letters)
    function getCurrentWordArray() {
        const numberOfGuessedWords = guessedLetters.length;
        return guessedLetters[numberOfGuessedWords - 1]
    }

    function updateGuessedWords(letter) {
        const currentWordArr = getCurrentWordArray();

        const currentLetter = word.charAt((nextSpace - 1) % numLetters);
        const currentShape = letterShape(currentLetter);
        const addedShape = letterShape(letter);

        if (currentShape !== addedShape) {
            return;
        }

        if (currentWordArr && currentWordArr.length < numLetters) {
            currentWordArr.push(letter);

            const availableSpaceEl = document.getElementById(String(nextSpace));
            nextSpace = nextSpace + 1;

            availableSpaceEl.textContent = letter;
        }
    }

    function getWordCorrectness(currentWordArr) {
        const tempAnswerArr = word.split('');
        let correctnessArr = []

        //Check if each letter is in the correct place.
        for (let i = 0; i < tempAnswerArr.length; i++) {
            const letter = currentWordArr[i];
            if (letter === tempAnswerArr[i]) {
                correctnessArr.push("RightPlace");
                //Use up the letter if it is.
                tempAnswerArr[i] = "."
            }
            else {
                correctnessArr.push("NotInWord");
            }
        }

        //Check if each letter is in the correct place.
        for (let i = 0; i < currentWordArr.length; i++) {
            const letter = currentWordArr[i];
            if (correctnessArr[i] === "RightPlace") {
                continue;
            }
            for (let j = 0; j < currentWordArr.length; j++) {
                if (letter === tempAnswerArr[j]) {
                    correctnessArr[i] = "WrongPlace";
                    tempAnswerArr[j] = "."
                    break;
                }
            }
        }
        
        return correctnessArr;
    }

    function getCorrectnessClass(correctness) {

        if (correctness === "NotInWord") {
            return ""
        }
        
        if (correctness === "RightPlace") {
            return "rightPlaceCol";
        }

        if (correctness == "WrongPlace") {
            return "wrongPlaceCol";
        }

        return "";
    }

    function updateCorrectness(currentCorrectness, newCorrectness) {
        
        if (currentCorrectness === "RightPlace" || newCorrectness === "RightPlace") {
            return "RightPlace";
        }

        if (currentCorrectness === "WrongPlace" || newCorrectness === "WrongPlace") {
            return "WrongPlace";
        }

        if (currentCorrectness === "NotInWord" || newCorrectness === "NotInWord") {
            return "NotInWord";
        }

        return "None";
    }

    function updateKeyboard(currentWord, correctnessArr) {
        //Add new letters to the guessed letters list.
        for (let i = 0; i < numLetters; ++i) {
            const index = (currentWord.charCodeAt(i) - 97);
            keyboardCorrectness[index] = updateCorrectness(keyboardCorrectness[index], correctnessArr[i])
        }

        //Change keyboard button colours if their letters have been used.
        for (let i = 0; i < keys.length; i++) {
            const letter = keys[i].getAttribute("data-key");
            
            if (letter === 'enter' || letter === 'del' || keyboardCorrectness[letterIndex(letter)] === "None") {
                continue;
            }

            let keyCorrectness = keyboardCorrectness[letterIndex(letter)];
            if (showCorrect === false && keyCorrectness === "RightPlace") {
                keyCorrectness = "WrongPlace";
            }

            keys[i].setAttribute("id", keyCorrectness);
        }
    }

    function handleSubmitWord() {
        if (gameFinished)
            return;
        //Get the current guess as an array of letters as strings.
        const currentWordArr = getCurrentWordArray();

        //Convert the array to a normal string.
        const currentWord = currentWordArr.join('');
        const firstLetterId = guessedWordCount * numLetters + 1;

        //Cancel if the word is less than the num letters.
        if (currentWordArr.length !== numLetters || (!allWordsList.includes(currentWord) && mustBeWord)) {
            for (let index = 0; index < numLetters; index++) {
                const letterId = firstLetterId + index;
                const letterEl = document.getElementById(letterId);

                if (!letterEl.classList.contains("animate__headShake")){
                    letterEl.classList.add("animate__headShake");
                    
                    setTimeout(() => {
                        letterEl.classList.remove("animate__headShake");
                    }, 800)
                }
            }
            return;
        }

        //Get the correctness of the guess.
        const correctnessArr = getWordCorrectness(currentWordArr);
        updateKeyboard(currentWord, correctnessArr);
        
        console.log(guessedLetters);

        
        if (saveLoadGuesses) {
            let saveData = [];
            //Save the word in local data.
            for (let i = 0; i < guessedLetters.length; i++) {
                saveData.push(guessedLetters[i].join(''));
            }
            setString("prevGuesses", saveData.join(','));
            setValue("saveDate", dayIndex)
        }

        if (currentWord === word) {
            //Display a message if the word is correct.
            gameFinished = true;
            points = 4 - guessedWordCount;
            correctAnimation(points);
            if (loading === false) {
                updateScore(points);
            }
        }
        else if (guessedLetters.length === numGuesses) {
            //Display the correct word if all guesses have been used.
            clueAnimation(currentWordArr, correctnessArr);
            failAnimation();
            if (allLettersFound()) {
                points = 1;
                if (loading === false) {
                    updateScore(points);
                }
            }
            else {
                points = 0;
                if (loading === false) {
                    updateScore(points);
                }
            }
        }
        else {
            clueAnimation(currentWordArr, correctnessArr);
        }

        //Increment the number of guesses used.
        guessedWordCount += 1;

        //Add a new empty guess to the guessed words list.
        guessedLetters.push([]);
    }

    function allLettersFound() {
        for (let i = 0; i < word.length; i++) {
            let letterCorrectness = keyboardCorrectness[word.charCodeAt(i) - 97];
            if (letterCorrectness != "RightPlace" && letterCorrectness != "WrongPlace") {
                return false;
            }
        }
        return true;
    }

    function updateScore(points) {
        if (saveLoadScore === false) {
            return;
        }

        if (points > 1) {
            numWins = updateValue("numWins", 1);
        }
        numGames = updateValue("numGames", 1);
        totalScore = updateValue("totalScore", points);
    }

    function correctAnimation(score) {
        const firstLetterId = guessedWordCount * numLetters + 1;

        //Animate each letter to change into green, yellow or grey based on the correct word.
        const interval = 200;
        let wordArr = word.split("");
        wordArr.forEach((letter, index) => {
            const letterId = firstLetterId + index;
            const letterEl = document.getElementById(letterId);
            setTimeout(() => {
                letterEl.classList.add("animate__flipInX");
                letterEl.classList.add(getCorrectnessClass("RightPlace"));
                //const tileColour = getCorrectnessClass("RightPlace");
                //letterEl.style = `background-color:${tileColour};`;

            }, interval * index)
        });

        let endMessage = "hurray";
        if (score === 4) {
            endMessage = "superb";
        }
        else if (score === 3) {
            endMessage = "huzzah"
        }
        else if (score === 2) {
            endMessage = "hooray";
        }
        gameEndAnimation(endMessage);
    }

    function clueAnimation(currentWordArr, correctnessArr) {
        const firstLetterId = guessedWordCount * numLetters + 1;

        //Animate each letter to change into green, yellow or grey based on the correct word.
        const interval = 200;
        currentWordArr.forEach((letter, index) => {
            const letterId = firstLetterId + index;
            const letterEl = document.getElementById(letterId);
            setTimeout(() => {
                letterEl.classList.add("animate__flipInX");
                let correctness = correctnessArr[index];
                if (correctness !== "NotInWord") {
                    if (showCorrect === false && correctness === "RightPlace") {
                        correctness = "WrongPlace";
                    }
                    letterEl.classList.add(getCorrectnessClass(correctness));
                    letterEl.style = `background-color:${tileColour};`;
                }

            }, interval * index)
        });
    }

    function failAnimation() {
        gameEndAnimation(word);
    }

    function gameEndAnimation(displayWord) {
        setTimeout(() => {
            let wordArr = displayWord.split("");
            let shapeArr = wordCode(displayWord);
            const interval = 200;
            const section = document.getElementById("replaceable-section");
            const keyboards = document.getElementsByClassName("keyboard-container")
            for (let kb of keyboards) {
                kb.classList.add("animate__animated");
                kb.classList.add("animate__fadeOut");
            }
            const gamePointAverage = Math.round((totalScore / numGames) * 50)
            setTimeout(() => {
                section.innerHTML = "";
                section.innerHTML = `
                <span id="results" class="animate__animated animate__fadeIn">
                    <div id="results-grid">
                        <div class="result-shape"></div>
                        <div class="result-shape"></div>
                        <div class="result-shape"></div>
                        <div class="result-shape"></div>
                        <div class="result-shape"></div>
                        <div class="result-shape"></div>
                    </div>
                </span>
                <span id="stats">
                    <div class="game-stats">Games played: ${numGames}</div>
                    <div class="game-stats">Game Point Average: ${gamePointAverage}%</div>
                </span>`;

                const resultShapes = section.getElementsByClassName("result-shape");
                Array.from(resultShapes).forEach((shape, index) => {
                    setTimeout(() => {
                        shape.classList.add("animate__animated");
                        shape.classList.add("animate__bounceInUp");
                        shape.classList.add(letterShapes[shapeArr[index]]);
                        shape.textContent = `${wordArr[index]}`
                    }, 300 + interval * index)
                });

                const buttons = section.getElementsByClassName("post-game");
                
                for (let i = 0; i < buttons.length; i++) {
                    buttons[i].onclick = ({ target }) => {                    
                        const action = target.getAttribute("data-key");
                        if (action === 'new') {
                            location.reload()
                            return;
                        }
                        if (action === 'words') {
                            //Show possible words for this shape.
                            alert(matchingWords);
                            return;
                        }
                    }
                }
            }, 1000)
        }, 1500)
    }

    function handleDeleteLetter() {
        if (gameFinished)
            return;

        const firstLetterId = guessedWordCount * numLetters + 1;
        if (nextSpace <= firstLetterId)
            return;
        const currentWordArr = getCurrentWordArray();
        currentWordArr.pop();

        guessedLetters[guessedLetters.length - 1] = currentWordArr;
        const deletedLetterEl = document.getElementById(String(nextSpace - 1));
        deletedLetterEl.textContent = "";
        nextSpace -= 1;
    }

    function createLetterSlots() {
        //Get the element with the 'board' id.
        const gameBoard = document.getElementById("board")

        for (let j = 0; j < numGuesses; j++) {
            for (let i = 0; i < numLetters; i++) {
                //Create a div element.
                let letterSlot = document.createElement("div");
                //Give it the correct class.
                const shape = letterShape(word.charAt(i));
                if (shape === "small") {
                    letterSlot.classList.add("small");
                }
                else if (shape === "high") {
                    letterSlot.classList.add("high");
                }
                else if (shape === "low") {
                    letterSlot.classList.add("low");
                }
                letterSlot.classList.add("animate__animated");
                //Set the id to index (+1).
                letterSlot.setAttribute("id", j * numLetters + i + 1);
                //Add the letter to the board.
                gameBoard.appendChild(letterSlot);
            }
        }
    }

    function setupKeys() {
        document.addEventListener('keydown', function(e) {
            if (gameFinished) {
                return;
            }
            let key = e.key;
            
            if (key === "Enter")
                handleSubmitWord();
            if (key === "Backspace" || key === "Delete")
                handleDeleteLetter();
    
            const code = key.charCodeAt(0) - 97
            if (code < 0 || code > 26)
                return;
            updateGuessedWords(key);
        });
    
        //Loop through each key, and give each an 'on click' event.
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i].getAttribute("data-key");
            const shape = letterShape(key);
            if (shape === "high") {
                keys[i].classList.add("high-button");
            }
            else if (shape === "low") {
                keys[i].classList.add("low-button");
            }
            else {
                keys[i].classList.add("small-button");
            }
    
            keys[i].onclick = ({ target }) => {
                if (gameFinished) {
                    return;
                }
                
                //Store the key data of the clicked key.
                const key = target.getAttribute("data-key");
                
                if (key === 'enter') {
                    handleSubmitWord();
                    return;
                }
    
                if (key === 'del') {
                    handleDeleteLetter();
                    return;
                }
    
                updateGuessedWords(key);
            }
        }
    }

    function setupInfoBox() {
        // Get the modal
        var infoBox = document.getElementById("info-box");
    
        // Get the button that opens the modal
        var btn = document.getElementById("info-button");
    
        // Get the <span> element that closes the modal
        var span = infoBox.getElementsByClassName("close")[0];
    
        // When the user clicks the button, open the modal 
        btn.onclick = function() {
        infoBox.style.display = "block";
        }
    
        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
        infoBox.style.display = "none";
        }
    
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == infoBox) {
                infoBox.style.display = "none";
            }
        }
    }
})