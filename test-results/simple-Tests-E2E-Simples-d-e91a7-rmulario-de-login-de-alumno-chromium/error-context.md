# Page snapshot

```yaml
- main [ref=e2]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Login Alumno" [level=1] [ref=e6]
      - paragraph [ref=e7]: Accede a tu cuenta personal
    - generic [ref=e8]:
      - generic [ref=e9]:
        - text: Usuario
        - textbox "Usuario" [disabled] [ref=e10]:
          - /placeholder: usuario123
        - generic [ref=e11]: 👤
      - generic [ref=e12]:
        - text: Contraseña
        - textbox "Contraseña" [disabled] [ref=e13]:
          - /placeholder: ••••••••
        - generic [ref=e14]: 🔒
      - generic [ref=e15]:
        - generic [ref=e16]:
          - checkbox "Recordar sesión" [ref=e17]
          - text: Recordar sesión
        - link "¿Olvidaste tu contraseña?" [ref=e18] [cursor=pointer]:
          - /url: "#"
      - button "Iniciando sesión... ⏳" [disabled] [ref=e19]:
        - text: Iniciando sesión...
        - generic [ref=e20]: ⏳
    - generic [ref=e21]:
      - generic [ref=e22]: Gym Access
      - paragraph [ref=e23]:
        - text: ¿Nuevo en el gimnasio?
        - link "Regístrate aquí" [ref=e24] [cursor=pointer]:
          - /url: "#"
```