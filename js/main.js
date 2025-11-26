if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      let reg;
      reg = await navigator.serviceWorker.register('/sw.js', { type: "module" });
      console.log('Service worker registrada! 😎', reg);
    } catch (err) {
      console.log('😥 Service worker registro falhou: ', err);
    }
  });
}

var constraints = { video: { facingMode: "user" }, audio: false };

const cameraView = document.querySelector("#camera--view"),
  cameraOutput = document.querySelector("#camera--output"),
  cameraSensor = document.querySelector("#camera--sensor"),
  cameraTrigger = document.querySelector("#camera--trigger"),
  nome = document.querySelector("#nome"),
  mensagem = document.querySelector("#mensagem"),
  historicoContainer = document.querySelector("#historico");

function cameraStart() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      cameraView.srcObject = stream;
    })
    .catch(function (error) {
      console.error("Ocorreu um erro ao acessar a câmera:", error);
    });
}

let db;
const request = indexedDB.open("CameraDB", 1);

   request.onupgradeneeded = function (event) {
   db = event.target.result;
   const store = db.createObjectStore("fotos", { keyPath: "id", autoIncrement: true });
   store.createIndex("data", "data", { unique: false });
   console.log("Banco criado ou atualizado com sucesso");
};

request.onsuccess = function (event) {
   db = event.target.result;
   console.log("Banco de dados executado com sucesso");
   listarFotos();
};

request.onerror = function (event) {
    console.error("Erro para executar o banco de dados", event);
};

function savePhoto(imageData) {
  if (!db) {
    console.error("Banco de dados não está pronto!");
    return;
  }
  const nomeValor = nome.value.trim();
  const mensagemValor = mensagem.value.trim();
  const transaction = db.transaction(["fotos"], "readwrite");
  const store = transaction.objectStore("fotos");
  const foto = { 
  data: imageData, 
  timestamp: new Date().toISOString(),
  nome: nomeValor,
  mensagem: mensagemValor
};
store.add(foto);


  transaction.oncomplete = () => {
    console.log("card gerado.");
      listarFotos();
   };
     transaction.onerror = (e) => console.error("Erro ao tirar ao tentar fotografar:", e);
}

function listarFotos() {
  if (!db) return;

  const transaction = db.transaction(["fotos"], "readonly");
  const store = transaction.objectStore("fotos");
  const request = store.getAll();

  request.onsuccess = (e) => {
    const fotos = e.target.result;
    historicoContainer.innerHTML = "";

    if (fotos.length === 0) {
    historicoContainer.innerHTML = "<p>Nenhuma foto tirada ainda.</p>";
      return;
    }
fotos.forEach((f) => {
  const div = document.createElement("div");

  div.classList.add("card");
  div.classList.add("foto-item");

  const img = document.createElement("img");
  img.src = f.data;
  
    const nome_usuario = document.createElement("h3");
    nome_usuario.textContent = `Nome: ${f.nome || "Anônimo"}`;
  
    const mensagem_do_usuario = document.createElement("p");
    mensagem_do_usuario.textContent = `Descrição: ${f.mensagem || "Sem Descrição"}`;

  const botao = document.createElement("buton");
  botao.classList.add("remover-FT");
  botao.textContent = "X";
  botao.onclick = () => removerFoto(f.id);
  div.appendChild(img);
  div.appendChild(botao);
  div.appendChild(nome_usuario);
  div.appendChild(mensagem_do_usuario);
  historicoContainer.appendChild(div);
});


  };
}

function removerFoto(id) {
  const transaction = db.transaction(["fotos"], "readwrite");
  const store = transaction.objectStore("fotos");
  store.delete(id);

  transaction.oncomplete = () => {
    console.log(`card com o Numero da foto: ${id} removido.`);
    listarFotos();
  };
  transaction.onerror = (e) => console.error("Erro ao tentar excluir a foto:", e);
}

cameraTrigger.onclick = function () {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);

  const imageData = cameraSensor.toDataURL("image/webp");

  savePhoto(imageData);
};

window.addEventListener("load", cameraStart, false);