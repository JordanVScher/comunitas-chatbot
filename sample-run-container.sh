#!/bin/bash

# arquivo de exemplo para iniciar o container
export SOURCE_DIR='/home/jordan/comunitas-chatbot-homol'
export DATA_DIR='/tmp/comunitas-chatbot-homol/data/'

# confira o seu ip usando ifconfig docker0|grep 'inet addr:'
export DOCKER_LAN_IP=$(ifconfig docker0 | grep 'inet addr:' | awk '{ split($2,a,":"); print a[2] }')

# porta que sera feito o bind
export LISTEN_PORT=2005

docker run --name comunitas-chatbot \
 -v $SOURCE_DIR:/src -v $DATA_DR:/data \
 -p $DOCKER_LAN_IP:$LISTEN_PORT:2700 \
 --cpu-shares=512 \
 --memory 1800m -dit --restart unless-stopped appcivico/comunitas-chatbot