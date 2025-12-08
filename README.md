# AgendaJS
Sistema de agendamento hospitalar feito em Node.js

## Sobre
AgendaJS é um sistema de agendamento hospitalar criado por Luiz Ferreira que permite a gestão de consultas e laudos médicos. Desenvolvido com Node.js (Express, Sequelize) no backend e React/Next.js no frontend.  

O sistema suporta diferentes perfis de usuário:
- **Admin**: gerencia usuários, especialidades e pode visualizar/remover todos os arquivos enviados.  
- **Médico**: gerencia sua agenda de horários, confirma/conclui consultas e envia laudos em PDF para pacientes.  
- **Paciente**: agenda consultas com médicos disponíveis, cancela suas próprias consultas e acessa/baixa seus laudos.  

### Funcionalidades
- Autenticação com JWT (login e registro, incluindo Google O-Auth).  
- Gestão de consultas: agendamento, confirmação, conclusão e cancelamento.  
- Gestão de horários de médicos.  
- Upload e download de laudos médicos em PDF (simulado).


## Como Rodar
Installe os packages do frontend e backend com seu package manager de preferencia. 
```
cd backend
pnpm i package
```
```
cd frontend
pnpm i package
```

Copie as informações do .env.example preencha para .env

rode ```pnpm run setup``` para iniciar database e dar seed de admin
-   Se quiser tambem pode rodar ```pnpm run demo``` para dar seed de usuários e especialidades de exemplo para o sistema

Por fim rode no frontend e backend:

```
pnpm run dev
```