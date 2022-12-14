import { eachLine } from "line-reader";
import { retiraComentarios } from "./retiraComentarios.js";
import { sintatico } from "./sintatico.js";

export function lexico(url) {
    const TYPE_TEXT = 0;
    const TYPE_DIGIT = 1;
    const TYPE_SIMBOLO = 2;

    const tokens = [];
    let flag = 0;
    let estado = 0;
    let elemento = '';


    const endToken = (typeToken) => {
        tokens.push({ type: typeToken, value: elemento });
        elemento = "";
    }


    //validando tipo do token
    const isDigit = (c) => {
        return parseInt(c) >= 0 && parseInt(c) <= 9
    }

    const isCaracter = (c) => {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')
    }

    const isSpace = (c) => {
        return c === ' ' || c === '\t' || c === '\n' || c === '\r'
    }


    const isSpecialCaracter = (c) => {
        return c === "{" || c === "}" || c === ";" || c === "," || c === "(" || c === ")" || c === "$" || c === ".";
    }

    const isOperadorAritmetico = (c) => {
        return c === '+' || c === '-' || c === '/' || c == '*'
    }

    const isOperadorLogico = (c) => {
        return c === '=' || c === '<' || c === '>' || c === ':'
    }


    eachLine(url, (line, last) => {
        for (let i = 0; i < line.length; i++) {
            if (estado === 0) {
                if (isCaracter(line[i])) {
                    estado = 1;
                    elemento = elemento + line[i];
                }

                else if (isDigit(line[i])) {
                    elemento = elemento + line[i];
                    estado = 3;
                }

                else if (isOperadorLogico(line[i])) {
                    elemento = elemento + line[i];
                    estado = 5;
                }

                else if (isSpace(line[i])) {
                    estado = 0;
                }

                else if (isOperadorAritmetico(line[i])) {
                    elemento = line[i];
                    endToken(TYPE_SIMBOLO);
                    estado = 0;
                }

                else if (isSpecialCaracter(line[i])) {
                    elemento = line[i];
                    endToken(TYPE_SIMBOLO);
                    estado = 0;
                }

                else {
                    flag = 1;
                }


            }

            else if (estado === 1) {
                if (isCaracter(line[i]) || isDigit(line[i])) {
                    estado = 1;
                    elemento = elemento + line[i];
                } else {
                    //voltar uma casa
                    i--;
                    endToken(TYPE_TEXT);
                    estado = 0;
                }
            }
            else if (estado === 3) {
                if (isDigit(line[i])) {
                    estado = 3;
                    elemento = elemento + line[i];
                } else {
                    i--;
                    endToken(TYPE_DIGIT);
                    estado = 0;
                }

            }
            else if (estado === 5) {
                if (isOperadorLogico(line[i])) {
                    elemento = elemento + line[i];
                    endToken(TYPE_SIMBOLO);
                    estado = 0;
                } else {
                    i--;
                    endToken(TYPE_SIMBOLO);
                    estado = 0;

                }
            }
        }

        if (last) {
            if (flag === 1) {
                throw new Error('Erro lexico');
            } else {
                sintatico(retiraComentarios(tokens));
            }
        }
    })
}