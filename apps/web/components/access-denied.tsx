/**
 * Access Denied Component
 * Displayed when user doesn't have permission to access a resource
 */

import { ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AccessDeniedProps {
  title?: string
  message?: string
}

export function AccessDenied({ 
  title = 'Brak dostępu', 
  message = 'Nie posiadasz uprawnień do przeglądania tej strony.' 
}: AccessDeniedProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-gray-600">
          <p>
            Jeśli uważasz, że powinieneś mieć dostęp do tego zasobu, 
            skontaktuj się z administratorem systemu.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
