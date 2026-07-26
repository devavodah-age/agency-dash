export default function DataDeletion() {
  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "#fff", fontFamily: "Arial, sans-serif", padding: "60px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ color: "#a78bfa", marginBottom: 8 }}>Exclusão de Dados</h1>
        <p style={{ color: "#888", marginBottom: 40 }}>Instrução de exclusão de dados do usuário</p>

        <h2 style={{ color: "#a78bfa" }}>Como solicitar a exclusão dos seus dados</h2>
        <p>Se você utilizou o login via Facebook/Meta na plataforma da Agência Avodah e deseja que seus dados sejam removidos, siga os passos abaixo:</p>

        <ol style={{ lineHeight: 2, paddingLeft: 20 }}>
          <li>Acesse as <strong>Configurações</strong> do seu Facebook</li>
          <li>Vá em <strong>Aplicativos e Sites</strong></li>
          <li>Encontre <strong>Agência Avodah</strong> e clique em <strong>Remover</strong></li>
          <li>Confirme a remoção</li>
        </ol>

        <p style={{ marginTop: 24 }}>Após a remoção, todos os seus dados associados à conta Meta serão excluídos da nossa plataforma em até <strong>30 dias</strong>.</p>

        <h2 style={{ color: "#a78bfa", marginTop: 40 }}>Exclusão manual</h2>
        <p>Para solicitar a exclusão completa da sua conta e todos os dados associados, entre em contato diretamente com a Agência Avodah informando seu e-mail cadastrado.</p>

        <div style={{ marginTop: 40, padding: "20px", background: "#1a1a1a", borderRadius: 12, border: "1px solid #333" }}>
          <p style={{ color: "#a78bfa", fontWeight: "bold" }}>Status da solicitação</p>
          <p style={{ color: "#888" }}>Após o contato, você receberá uma confirmação em até 5 dias úteis com o status da exclusão dos seus dados.</p>
        </div>
      </div>
    </div>
  )
}
