import { useState, ChangeEvent } from 'react'

interface ValidationRule<T> {
  validate: (value: any, formData: T) => boolean
  errorMessage: string
}

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>[]
}

interface UseFormOptions<T> {
  initialValues: T
  validationRules?: ValidationRules<T>
  onSubmit?: (values: T) => void | Promise<void>
}

export function useForm<T extends Record<string, any>>({ 
  initialValues, 
  validationRules = {},
  onSubmit
}: UseFormOptions<T>) {
  const [formData, setFormData] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValid, setIsValid] = useState(false)
  
  // Validate a single field
  const validateField = (name: keyof T, value: any): string => {
    const fieldRules = validationRules[name] || []
    
    for (const rule of fieldRules) {
      const isValid = rule.validate(value, formData)
      if (!isValid) {
        return rule.errorMessage
      }
    }
    
    return ''
  }
  
  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let formIsValid = true
    
    // Check each field with validation rules
    for (const field in validationRules) {
      const fieldName = field as keyof T
      const error = validateField(fieldName, formData[fieldName])
      
      if (error) {
        newErrors[fieldName] = error
        formIsValid = false
      }
    }
    
    setErrors(newErrors)
    setIsValid(formIsValid)
    return formIsValid
  }
  
  // Handle field change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    let fieldValue: any = value
    
    // Convert value based on input type
    if (type === 'number') {
      fieldValue = value === '' ? '' : Number(value)
    } else if (type === 'checkbox') {
      fieldValue = (e.target as HTMLInputElement).checked
    }
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }))
    
    // Validate field if it has rules
    if (validationRules[name as keyof T]) {
      const error = validateField(name as keyof T, fieldValue)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }
  
  // Handle selection change for custom components
  const handleSelectChange = (name: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Validate field if it has rules
    if (validationRules[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }
  
  // Set field value programmatically
  const setFieldValue = (name: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Validate field if it has rules
    if (validationRules[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields before submission
    const isFormValid = validateForm()
    
    if (isFormValid && onSubmit) {
      setIsSubmitting(true)
      try {
        await onSubmit(formData)
      } catch (error) {
        console.error('Form submission error:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }
  
  // Reset form to initial values
  const resetForm = () => {
    setFormData(initialValues)
    setErrors({})
  }
  
  return {
    formData,
    errors,
    isValid,
    isSubmitting,
    handleChange,
    handleSelectChange,
    setFieldValue,
    handleSubmit,
    resetForm,
    validateForm
  }
}