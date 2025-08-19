'use client';

import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Input as ChakraInput,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiLogIn, FiUser } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/session', { cache: 'no-store' });
        if (!cancelled && res.ok) {
          window.location.href = '/dashboard';
        }
      } catch (e) {
        // silent
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro desconhecido');
        return;
      }

      if (data.usuario) {
        localStorage.setItem('cantina_user', JSON.stringify(data.usuario));
      }
      if (data.token) {
        localStorage.setItem('cantina_token', data.token);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (checkingSession) {
    return (
      <Center minH='100vh' bg='gray.50'>
        <Text color='gray.500' fontSize='sm'>
          Verificando sessão...
        </Text>
      </Center>
    );
  }

  return (
    <Box minH='100vh' bgGradient='linear(to-br, blue.50, white, blue.50)' p={6}>
      <Center>
        <VStack spacing={6} w='full' maxW='md' align='stretch'>
          <Box textAlign='center'>
            <Box
              display='inline-flex'
              alignItems='center'
              justifyContent='center'
              w='80px'
              h='80px'
              bgGradient='linear(to-br, blue.600, blue.700)'
              borderRadius='16px'
              boxShadow='lg'
              mb={4}
            >
              <Text color='white' fontWeight='bold' fontSize='3xl'>
                C
              </Text>
            </Box>
            <Heading as='h1' size='lg'>
              Sistema Cantina
            </Heading>
            <Text color='gray.600' mt={1}>
              ERP Cantina Escolar
            </Text>
          </Box>

          <Box bg='white' boxShadow='2xl' borderRadius='md' p={8}>
            <form onSubmit={handleSubmit} noValidate>
              <VStack spacing={5} align='stretch'>
                <Box textAlign='center'>
                  <Heading as='h2' size='md'>
                    Faça seu login
                  </Heading>
                  <Text color='gray.600' fontSize='sm' mt={2}>
                    Entre com suas credenciais para acessar o sistema
                  </Text>
                </Box>

                <FormControl>
                  <FormLabel>Usuário</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents='none' color='gray.400'>
                      <FiUser />
                    </InputLeftElement>
                    <ChakraInput
                      type='text'
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      placeholder='Digite seu usuário'
                      autoComplete='username'
                      autoFocus
                      aria-describedby={error ? 'login-error' : undefined}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>Senha</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents='none' color='gray.400'>
                      <FiLock />
                    </InputLeftElement>
                    <ChakraInput
                      type={showPassword ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder='Digite sua senha'
                      autoComplete='current-password'
                    />
                    <InputRightElement>
                      <Button
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        size='sm'
                        variant='ghost'
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Stack direction='row' align='center' justify='space-between'>
                  <Checkbox
                    isChecked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  >
                    Lembrar-me
                  </Checkbox>
                  <ButtonLink />
                </Stack>

                {error && (
                  <Alert status='error' id='login-error' aria-live='assertive'>
                    <AlertIcon />
                    <Text fontSize='sm'>
                      {error === 'credenciais_invalidas'
                        ? 'Usuário ou senha incorretos'
                        : error === 'usuario_e_senha_obrigatorios'
                        ? 'Usuário e senha são obrigatórios'
                        : error === 'server_error'
                        ? 'Erro no servidor. Tente novamente.'
                        : error}
                    </Text>
                  </Alert>
                )}

                <Button
                  type='submit'
                  colorScheme='blue'
                  size='lg'
                  isLoading={loading}
                  leftIcon={<FiLogIn />}
                  isDisabled={!usuario || !senha || loading}
                  w='full'
                >
                  {loading ? 'Entrando...' : 'Entrar no Sistema'}
                </Button>
                <Box textAlign='center' pt={4}>
                  <Text
                    as='button'
                    fontSize='sm'
                    color='blue.600'
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Esqueceu sua senha?
                  </Text>
                </Box>
              </VStack>
            </form>
          </Box>
          <Box textAlign='center' color='gray.500' fontSize='sm'>
            <Text>© 2025 Sistema Cantina Escolar</Text>
            <Text mt={1}>Desenvolvido com Next.js e TypeScript</Text>
          </Box>
        </VStack>
      </Center>
    </Box>
  );
}

function ButtonLink() {
  return (
    <Text as='button' fontSize='sm' color='blue.600' _hover={{ textDecoration: 'underline' }}>
      Esqueceu sua senha?
    </Text>
  );
}
