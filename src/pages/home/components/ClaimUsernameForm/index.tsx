import { Button, Text, TextInput } from '@ignite-ui/react'
import { Form, FormMessages } from './styles'
import { ArrowRight } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'

const claimUsernameFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'O usuário deve ter no mínimo 3 letras.' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'O usuário só pode conter letras e hifen.',
    })
    .transform((username) => username.toLowerCase()),
})

type ClaimUsernameFormProps = z.infer<typeof claimUsernameFormSchema>

export function ClaimUsernameForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClaimUsernameFormProps>({
    resolver: zodResolver(claimUsernameFormSchema),
  })

  const router = useRouter()

  async function handleClaimUsername(data: ClaimUsernameFormProps) {
    const { username } = data

    await router.push(`/register?username=${username}`)
  }

  return (
    <>
      <Form as="form" onSubmit={handleSubmit(handleClaimUsername)}>
        <TextInput
          size="sm"
          prefix="ignite.com/"
          placeholder="seu-usuario"
          {...register('username')}
        />
        <Button type="submit">
          Reservar
          <ArrowRight />
        </Button>
      </Form>
      <FormMessages>
        <Text>
          {errors.username
            ? errors.username.message
            : 'Digite um nome de úsuario!'}
        </Text>
      </FormMessages>
    </>
  )
}
