const { app, syncDatabase } = require('./app');

const port = process.env.PORT || 3001;

syncDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`API rodando na porta ${port}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao iniciar:', err);
    process.exit(1);
  });
