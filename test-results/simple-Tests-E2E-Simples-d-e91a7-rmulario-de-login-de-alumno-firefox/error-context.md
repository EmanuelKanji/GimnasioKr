# Page snapshot

```yaml
- main [ref=e2]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Login Alumno" [level=1] [ref=e6]
      - paragraph [ref=e8]: Accede a tu cuenta personal
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]: Usuario
        - textbox "Usuario" [disabled] [ref=e12] [cursor=pointer]:
          - /placeholder: usuario123
        - generic [ref=e13]: 👤
      - generic [ref=e14]:
        - generic [ref=e15]: Contraseña
        - textbox "Contraseña" [disabled] [ref=e16] [cursor=pointer]:
          - /placeholder: ••••••••
        - generic [ref=e17]: 🔒
      - generic [ref=e18]:
        - generic [ref=e19] [cursor=pointer]: Recordar sesión
        - link "¿Olvidaste tu contraseña?" [ref=e21] [cursor=pointer]:
          - /url: "#"
      - button "Iniciando sesión... ⏳" [disabled] [ref=e22]:
        - generic [ref=e23]: Iniciando sesión...
        - generic [ref=e24]: ⏳
    - generic [ref=e25]:
      - generic [ref=e26]: Gym Access
      - paragraph [ref=e27]:
        - text: ¿Nuevo en el gimnasio?
        - link "Regístrate aquí" [ref=e28] [cursor=pointer]:
          - /url: "#"
```