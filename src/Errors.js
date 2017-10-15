function ErrorsType(content) {
    this.content = content;
}


const conditionFailed = lexer =>
    new ErrorsType([0, lexer]);


const orFailed = lexer =>
    new ErrorsType([2, lexer]);


module.exports = {
    conditionFailed,
    orFailed
};