Reto Tecnico TypeScript - nodejs - AWS
Requerimientos de uso
credenciales de AWS IAM para poder hacer deploy

Instrucciones de uso
En la terminal colocar aws configure seguidamente colocar sus credenciales proporcionadas por AWS para el despliegue en su cuenta

Instalamos dependencias para ejecutar en entorno local
npm install

Iniciamos el proyecto
npm run dev
Esto nos iniciara el proyecto con serverless offline, donde se expondra los servicios en la consola para ser consumidos
ejemplo de request
https://documenter.getpostman.com/view/12046942/2s83mjEg7y

pruebas unitarias
npm run test

despliegue
npm run deploy
