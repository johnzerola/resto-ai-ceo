# Configuração de Autenticação - Supabase

## Configuração obrigatória no Supabase

Para que a autenticação funcione corretamente tanto em localhost quanto em produção, é necessário configurar as URLs de redirecionamento no Supabase.

### Passos para configuração:

1. Acesse o painel do Supabase
2. Vá para **Authentication → URL Configuration**
3. Configure as seguintes URLs:

#### Site URL
```
https://seudominio.com
```
ou para desenvolvimento:
```
http://localhost:3000
```

#### Redirect URLs
Adicione todas as URLs onde sua aplicação pode estar rodando:

```
http://localhost:3000/login?confirmed=true
https://seudominio.com/login?confirmed=true
https://deploy-url.vercel.app/login?confirmed=true
```

### URLs importantes para adicionar:
- URL de desenvolvimento local: `http://localhost:3000/login?confirmed=true`
- URL de produção: `https://seudominio.com/login?confirmed=true`
- URL de preview/staging se houver

## Como funciona o fluxo de confirmação

1. Usuário se registra
2. Sistema gera automaticamente URL: `${window.location.origin}/login?confirmed=true`
3. Supabase envia email com link de confirmação
4. Usuário clica no link e é redirecionado para `/login?confirmed=true`
5. Aplicação detecta o parâmetro `confirmed=true` e mostra mensagem de sucesso

## Tratamento de erros implementado

O sistema agora traduz automaticamente erros do Supabase para mensagens amigáveis em português:

- **"User already registered"** → **"E-mail já cadastrado"**
- **"Invalid login credentials"** → **"Credenciais inválidas"**
- **"Email not confirmed"** → **"E-mail não confirmado. Verifique sua caixa de entrada."**
- **"Unable to validate email redirect"** → **"URL de redirecionamento não permitida. Confira a configuração no Supabase → Auth → URL Configuration"**

## Testando a configuração

1. Registre um novo usuário
2. Verifique se recebe o email de confirmação
3. Clique no link do email
4. Deve ser redirecionado para a página de login com mensagem de confirmação
5. Faça login normalmente

Se algo não funcionar, verifique se as URLs estão corretamente configuradas no Supabase.