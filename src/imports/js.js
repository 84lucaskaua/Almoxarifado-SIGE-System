// script.js

function login() {

  // pega o que o usuário digitou
  var email = document.getElementById("email").value;
  var senha = document.getElementById("senha").value;

  // verifica se está correto
  if (email == "admin@sige.com" && senha == "admin123") {
    alert("Login realizado com sucesso!");
  } else {
    alert("Email ou senha incorretos.");
  }

}