
const generateStrongPassword = () => {
    // Define character sets for each type of character
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numericChars = '0123456789';
    const specialChars = '!@#$%^&*()-_=+';

    // Combine all character sets
    const allChars = lowercaseChars + uppercaseChars + numericChars + specialChars;

    // Set the length of the password
    const passwordLength = 12; // You can adjust this value as needed

    // Initialize the generated password
    let password = '';

    // Generate random characters for the password
    for (let i = 0; i < passwordLength; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
    }

    return password;
};

export default generateStrongPassword;
