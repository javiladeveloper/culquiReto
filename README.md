<br />
<div align="center">
  <a href="https://github.com/javiladeveloper/culquiReto">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Reto Tecnico TypeScript - nodejs - AWS</h3>
</div>

<!-- GETTING STARTED -->

## Requerimientos de uso

npm

```sh
npm install -g serverless
```

git

```sh
https://git-scm.com/downloads
```

Node

```sh
https://nodejs.org/en/download/
```

### Installation

1. Clone the repo
   ```sh
   git clone git@github.com:javiladeveloper/culquiReto.git
   ```
2. Credenciales de AWS IAM para poder hacer deploy

- Instrucciones de uso
  En la terminal colocar `aws configure` seguidamente colocar sus credenciales proporcionadas por AWS para el despliegue en su cuenta

3. Instalamos dependencias para ejecutar en entorno local
   npm install

4. Iniciamos el proyecto

   - npm run dev
     Esto nos iniciara el proyecto con serverless offline, donde se expondra los servicios en la consola para ser consumidos
     ejemplo de request
     `https://documenter.getpostman.com/view/12046942/2s83mjEg7y`

5. Pruebas unitarias
   npm run test

6. Despliegue AWS
   npm run deploy

7. Despliegue OFFLine
   npm run dev
