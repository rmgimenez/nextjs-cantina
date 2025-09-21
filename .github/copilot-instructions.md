# Sistema de Controle de Cantina Escolar - AI Agent Instructions

## Architecture Overview

**Framework**: Next.js 15 with App Router and TypeScript
**Database**: MySQL with `cant_` prefixed tables, integrates with existing APS system
**Authentication**: JWT-based with HttpOnly cookies, bcrypt password hashing
**Styling**: Bootstrap 5 with custom color palette
**Package Manager**: pnpm with Turbopack

## Key Patterns & Conventions

### Database Layer (`lib/db.ts`)

```typescript
// Always use parameterized queries to prevent SQL injection
const rows = await query(
  "SELECT * FROM cant_usuarios_cantina WHERE usuario = ?",
  [usuario]
);
return rows && rows[0] ? (rows[0] as User) : null;
```

### Authentication Flow

- **Login**: POST `/api/auth/login` → sets HttpOnly cookie with JWT
- **Verification**: GET `/api/auth/me` → reads cookie, verifies JWT
- **Logout**: POST `/api/auth/logout` → clears cookie
- **Client-side**: Check auth on page load, redirect to `/login` if not authenticated

### API Route Pattern (`app/api/`)

```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Process request
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

### Component Structure

- **Client Components**: Use `"use client"` directive
- **Authentication Check**: Implement in `useEffect` with redirect to `/login`
- **Loading States**: Show spinner during auth verification
- **Error Handling**: Console.error for debugging, user-friendly messages

### Styling System

```css
/* Custom CSS variables defined in globals.css */
--azul-principal: #253287;
--vermelho-principal: #b20000;
--amarelo-principal: #fea800;

/* Bootstrap overrides */
.btn-primary {
  background-color: var(--azul-principal);
}
.text-primary {
  color: var(--azul-principal) !important;
}
```

## Database Schema Patterns

### Table Naming

- **Prefix**: All cantina tables use `cant_` prefix
- **Examples**: `cant_usuarios_cantina`, `cant_produtos`, `cant_vendas`
- **Foreign Keys**: Reference existing APS tables (`alunos`, `funcionarios`) without modification

### Common Fields

```sql
-- Audit fields (include in all tables)
`dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
`dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
`criado_por` int DEFAULT NULL,

-- Status fields
`ativo` tinyint(1) DEFAULT 1,

-- Foreign key pattern
KEY `fk_cant_table_field` (`field_id`),
CONSTRAINT `fk_cant_table_field` FOREIGN KEY (`field_id`) REFERENCES `other_table` (`id`)
```

## Development Workflow

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server (uses port 3001 if 3000 is busy)
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm build  # Includes TypeScript compilation
```

### Database Setup

1. Create MySQL database (default: `sant31br`)
2. Run `bancodados.sql` to create tables
3. Configure `.env.local` with database credentials
4. Use `bancodados-drop.sql` for cleanup

### Environment Variables

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=sant31br
JWT_SECRET=your_jwt_secret_here
```

## Integration Points

### APS System Integration

- **Read-only access** to existing tables: `alunos`, `funcionarios`, `cadastro_alunos`
- **Student photos**: `https://sistema.santanna.g12.br/carometr/${ra}.jpg`
- **Data synchronization**: Manual updates, no automatic sync implemented yet

### External Dependencies

- **mysql2**: Database connection with connection pooling
- **bcryptjs**: Password hashing (not bcrypt - note the 'js' suffix)
- **jsonwebtoken**: JWT token handling
- **bootstrap**: UI framework loaded via `bootstrap-client.tsx`

## Common Implementation Patterns

### User Authentication Check

```typescript
useEffect(() => {
  async function checkAuth() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (!data.authenticated) {
      router.push("/login");
    } else {
      setUser(data.user);
    }
  }
  checkAuth();
}, [router]);
```

### Database Query with Error Handling

```typescript
try {
  const rows = await query("SELECT * FROM cant_produtos WHERE ativo = ?", [1]);
  return rows as Product[];
} catch (error) {
  console.error("Database error:", error);
  throw new Error("Failed to fetch products");
}
```

### API Response Pattern

```typescript
return NextResponse.json(
  { error: "Validation failed", details: errors },
  { status: 400 }
);
```

## File Organization

```
app/
├── api/auth/          # Authentication endpoints
├── login/            # Login page
├── page.tsx          # Protected dashboard
└── globals.css       # Global styles with custom colors

lib/
├── auth.ts           # Authentication utilities
├── db.ts            # Database connection & queries
└── jwt.ts           # JWT token handling

bancodados.sql       # Database schema
bancodados-drop.sql  # Database cleanup
```

## Security Considerations

- **Passwords**: Always hash with bcryptjs before storing
- **JWT**: Use HttpOnly cookies, 8-hour expiration
- **SQL Injection**: Always use parameterized queries
- **CORS**: Configure appropriately for production
- **Input Validation**: Validate all user inputs on both client and server

## Performance Patterns

- **Database**: Use connection pooling (configured in `lib/db.ts`)
- **Images**: Student photos loaded from external URL
- **Caching**: No caching implemented yet - consider for production
- **Bundle**: Bootstrap loaded dynamically to reduce initial bundle size

## Testing Strategy

- **API Routes**: Test with tools like Postman or Thunder Client
- **Authentication**: Test login/logout flow manually
- **Database**: Verify queries in MySQL Workbench
- **UI**: Manual testing in browser, check responsive design

## Deployment Notes

- **Build**: `pnpm build` creates optimized production build
- **Environment**: Set `NODE_ENV=production` for security features
- **Database**: Ensure production database has same schema as development
- **Static Assets**: Student photos served from external domain</content>
  <parameter name="filePath">d:\dev\nextjs-cantina\.github\copilot-instructions.md
