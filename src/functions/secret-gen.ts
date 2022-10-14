export const generateSecret = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let secret = "";
    for (let i = 0; i < 64; i++) {
        secret += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return secret;
}