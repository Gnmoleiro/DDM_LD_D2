# iTask-API

## Visão Geral

O **iTask-API** é a interface de programação de aplicações (API) responsável pelo gerenciamento de tarefas (To-Do List). Ela fornece os endpoints necessários para criar, ler, atualizar e excluir tarefas, servindo como o *backend* para o aplicativo cliente (iTask-app).

## Tecnologias Chave

* **Python**: Linguagem principal de desenvolvimento.
* **[Framework]**: *Flask*
* **[Base de dados]**: *SQLite*

## Pré-requisitos

Certifique-se de ter os seguintes softwares instalados em seu sistema:

* **Python 3.8 ou superior**: Necessário para a execução da API.
* **pip**: Gerenciador de pacotes do Python.

## Configuração do Ambiente de Desenvolvimento

Siga os passos abaixo para configurar e preparar o ambiente para rodar a API.

### 1. Clonar o Repositório

```bash
git clone https://github.com/Gnmoleiro/DDM_LD_D2.git
cd iTask-API
```

### 2. Criar e Ativar o Ambiente Virtual
É altamente recomendado o uso de um ambiente virtual para isolar as dependências do projeto:

```bash
python -m venv venv
```

**Ativação:**

Windows:
```bash
venv\Scripts\activate
```

Linux / macOS
```bash
source venv/bin/activate
```

### 3. Instalar as Dependências

Com o ambiente virtual ativado, instale todas as bibliotecas necessárias listadas no arquivo requirements.txt:

```bash
pip install -r requirements.txt
```