# Neon Star Defender

Arcade espacial em pixel art neon, feito com HTML5 Canvas, CSS e JavaScript puro.
O jogo roda direto no navegador, sem login, sem instalação e sem servidor.

## O que tem no jogo

- Você pilota uma nave e enfrenta ondas de invasores.
- Começa com 3 vidas. Cada tiro ou colisão custa 1 vida e deixa a nave invulnerável por alguns segundos.
- Três inimigos: **Batedor** (desce reto), **Serpente** (zigue-zague) e **Atirador** (mira e atira).
- A cada 5 ondas aparece uma **Nave-Mãe** (chefe) com barra de vida e dois ataques: leque de projéteis e rajada radial.
- Três melhorias temporárias: **Escudo**, **Tiro duplo** e **Disparo rápido**.
- Placar, vidas, onda atual, pausa e opção de silenciar o som.
- Os 5 melhores recordes ficam salvos no próprio navegador.

## Como abrir no computador

1. Extraia o arquivo ZIP.
2. Mantenha os 4 arquivos (`index.html`, `style.css`, `script.js` e `README.md`) na mesma pasta.
3. Dê dois cliques em `index.html`. O jogo abre no seu navegador (Chrome, Edge ou Firefox).

Não precisa instalar nada. Se o navegador perguntar, permita o áudio para ouvir os efeitos sonoros.

## Como abrir no celular Android

A forma mais fácil é publicar no GitHub Pages (passo a passo mais abaixo) e abrir o link no Chrome do celular.
Abrir o arquivo direto do armazenamento do celular depende do gerenciador de arquivos: escolha "Abrir com" e selecione o Chrome.

## Controles

**Computador**

- `WASD` ou setas: mover a nave
- `Espaço`: atirar
- `Esc`: pausar e continuar

**Celular**

- Arraste o dedo pela área de jogo para mover a nave.
- O tiro é automático durante a partida.
- Use o botão de pausa (dois tracinhos) no canto superior direito.

## Inimigos, chefes e melhorias

| Elemento | Como funciona |
| --- | --- |
| Batedor | Desce em linha reta, com leve oscilação. |
| Serpente | Avança em zigue-zague. |
| Atirador | Para na tela e dispara uma rajada mirada na sua nave. |
| Nave-Mãe | Aparece na onda 5, 10, 15 e assim por diante. Alterna entre leque de projéteis e rajada radial. Ao ser destruída, solta melhorias. |
| Escudo | Absorve um impacto (ou dura alguns segundos). |
| Tiro duplo | Dispara dois projéteis por vez por 12 segundos. |
| Disparo rápido | Acelera a cadência de tiro por 12 segundos. |

A dificuldade aumenta a cada onda: mais inimigos, mais rápidos e com mais tiros.

## Recordes

Os 5 melhores resultados ficam guardados no `localStorage` do navegador, com a data de cada partida.
Eles continuam lá mesmo depois de fechar o jogo. Se você limpar os dados do site (ou usar uma aba anônima), os recordes são apagados.
O botão de som também lembra a sua escolha entre uma partida e outra.

## Como publicar no GitHub Pages

1. Crie uma conta no GitHub e um repositório **público** (por exemplo `neon-star-defender`).
2. Na página do repositório, use **Add file > Upload files** e envie os 4 arquivos: `index.html`, `style.css`, `script.js` e `README.md`.
   Envie os arquivos separados. Se enviar apenas o ZIP, o GitHub não descompacta e o jogo não funciona.
3. Vá em **Settings > Pages**.
4. Em **Source**, escolha **Deploy from a branch**, selecione a branch `main` e a pasta `/ (root)`. Clique em **Save**.
5. Espere de 1 a 2 minutos e abra `https://SEU-USUARIO.github.io/neon-star-defender/`.
6. Para atualizar o jogo depois, envie as novas versões dos arquivos por cima das antigas.

O link funciona no computador e no celular Android.

## Estrutura dos arquivos

```
index.html   Estrutura das telas (menu, como jogar, recordes, pausa e fim de jogo)
style.css    Visual neon, layout responsivo e adaptação para telas pequenas
script.js    Lógica do jogo: jogador, inimigos, chefes, melhorias, som e recordes
README.md    Este guia
```

Todas as imagens (naves, inimigos, explosões, fundo) são desenhadas por código em pixel art, e os sons são gerados pelo próprio navegador. Não há arquivos externos para baixar.

## Testes realizados

- Iniciar partida, mover com teclado e atirar com Espaço.
- Pausar e continuar com Esc e com o botão de pausa.
- Reiniciar a partida pela tela de pausa e pela tela de fim de jogo.
- Tela de fim de jogo com pontuação final e volta ao menu.
- Os três tipos de inimigo aparecendo e se comportando de forma diferente.
- As três melhorias coletáveis funcionando (escudo absorvendo dano, tiro duplo e disparo rápido).
- Transição da onda 4 para a onda 5, aviso do chefe, barra de vida e os dois padrões de ataque; derrota do chefe e avanço de onda.
- Recordes: limite de 5, ordem do maior para o menor e permanência depois de fechar e reabrir o navegador.
- Controle por toque (arrastar o dedo), tiro automático e botão de pausa em tela de celular emulada (390 x 844).
- Rolagem correta da tela "Como jogar" em tela pequena, sem a página inteira rolar junto.
- Ausência de erros de JavaScript nas cenas testadas.

Os testes foram feitos no Chrome em modo automatizado, com tela de celular emulada. Não foi testado em um aparelho Android físico, e o som não pôde ser ouvido nesse modo de teste (apenas verificado que não gera erros).
