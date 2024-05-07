// Function to normalize a string (convert to lowercase, trim whitespace, remove non-alphanumeric characters if they're not individual characters, and remove Roman numerals)
function normalizeString(str) {
    // Regular expression to match Roman numerals at the start of the string
	const romanNumeralRegex = /^\b(?:M{0,3})(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})\s*-\s*(?=\s|$)/gi;
    // Regular expression to match non-alphanumeric characters excluding "!" and "?"
	const nonAlphanumericRegex = /[^a-zA-Z0-9!?']/g;
    return str.replace(romanNumeralRegex, '').replace(nonAlphanumericRegex, ' ').trim();
}

// Function to get a random entry from an array
function getRandomEntry(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

// Function to check if a question already exists in triviaSet
function isQuestionUnique(question, triviaSet) {
    if (!triviaSet || !triviaSet.questions || triviaSet.questions.length === 0) {
        // If triviaSet is empty or not defined, any question is considered unique
        return true;
    }

    // Check if the question already exists in triviaSet
    const existingQuestions = triviaSet.questions;
    for (const existingQuestion of existingQuestions) {
        if (existingQuestion.triviaQuestion === question.triviaQuestion && existingQuestion.triviaAnswer === question.triviaAnswer) {
            // If the question already exists, it's not unique
            return false;
        }
    }
    // If the question does not exist in triviaSet, it's unique
    return true;
}

// Primary function to generate unique question data
function generateUniqueQuestion(triviaSet) {
    try {
        const dataObject = JSON.parse(parameters[0] || '{}');
        const dataEntries = dataObject.entries || [];

        if (dataEntries.length === 0) {
            throw new Error('No data found in custom variables.');
        }

        let randomEntry;
        let validQuestion = false;

        while (!validQuestion) {
            randomEntry = getRandomEntry(dataEntries);

            let answer, question;
            if ("Name" in randomEntry && "Data" in randomEntry) {
                answer = randomEntry.Name;
                question = randomEntry.Data;
            } else if ("Answer" in randomEntry && "Question" in randomEntry) {
                answer = randomEntry.Answer;
                question = randomEntry.Question;
            } else {
                throw new Error('Invalid data format in the entry.');
            }

            const normalizedAnswer = normalizeString(answer);
            const normalizedQuestion = normalizeString(question);

            if (!normalizedQuestion.includes(normalizedAnswer)) {
                validQuestion = true;
            }
        }

        const triviaQuestion = {
            triviaQuestion: randomEntry.Question || randomEntry.Data,
            triviaAnswer: normalizeString(randomEntry.Answer || randomEntry.Name)
        };

        console.log('Trivia Question:', JSON.stringify(triviaQuestion));

        if (isQuestionUnique(triviaQuestion, triviaSet)) {
            return triviaQuestion;
        } else {
            return generateUniqueQuestion(triviaSet);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        return { triviaQuestion: 'Only duplicate questions available, please run !trivia stop or wait for trivia to stop automatically', triviaAnswer: '' };
    }
}


// Assign parameters[1] to triviaSet
const triviaSet = parameters[1] ? JSON.parse(parameters[1]) : {"questions": []};

// Generate a unique question
const uniqueTriviaQuestion = generateUniqueQuestion(triviaSet);

if (uniqueTriviaQuestion) {
    console.log(JSON.stringify(uniqueTriviaQuestion));
    return JSON.stringify(uniqueTriviaQuestion);
} else {
    console.log('Failed to generate a unique question.');
    return null;
}
