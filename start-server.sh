#!/bin/bash

# Nombre que queremos darle al contenedor
NAME="kobo-annotations-export"
PORT="8003"

echo "Reiniciando servidor con soporte para Markups..."

# Paramos y borramos cualquier versión anterior
docker stop $NAME 2>/dev/null
docker rm $NAME 2>/dev/null

# Arrancamos el contenedor
# Explicación del volumen: 
# Montamos la carpeta actual ($PWD) que contiene tanto el HTML como la subcarpeta /markups
docker run -d \
  --name $NAME \
  -p $PORT:80 \
  -v "$PWD":/usr/share/nginx/html \
  --restart unless-stopped \
  nginx:alpine

echo "----------------------------------------------------------------"
echo "Servidor activo en: http://$(hostname -I | awk '{print $1}'):$PORT"
echo "Asegúrate de que la carpeta 'markups/' esté al lado de este script."
echo "----------------------------------------------------------------"
