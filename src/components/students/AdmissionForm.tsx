"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { studentSchema, type StudentFormData } from "@/lib/validations"
import { createStudent } from "@/actions/student"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
const sections = ["A", "B", "C", "D"]

export function AdmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  })

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true)
    setMessage(null)

    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      const result = await createStudent(formData)

      if (result.success) {
        setMessage({ type: "success", text: "Student admitted successfully!" })
        reset()
      } else {
        setMessage({ type: "error", text: result.error || "Failed to create student" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Student Admission</CardTitle>
        <CardDescription>Fill in the student details below to register a new student</CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert className={`mb-6 ${message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  onValueChange={(value) => setValue("gender", value as "male" | "female" | "other")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-500">{errors.gender.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Enrollment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Enrollment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class *</Label>
                <Select
                  onValueChange={(value) => setValue("className", String(value ?? ""))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        Class {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.className && (
                  <p className="text-sm text-red-500">{errors.className.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Section *</Label>
                <Select
                  onValueChange={(value) => setValue("section", String(value ?? ""))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((sec) => (
                      <SelectItem key={sec} value={sec}>
                        Section {sec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.section && (
                  <p className="text-sm text-red-500">{errors.section.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number *</Label>
                <Input
                  id="rollNumber"
                  {...register("rollNumber")}
                  placeholder="Enter roll number"
                />
                {errors.rollNumber && (
                  <p className="text-sm text-red-500">{errors.rollNumber.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number *</Label>
                <Input
                  id="contact"
                  {...register("contact")}
                  placeholder="Enter contact number"
                />
                {errors.contact && (
                  <p className="text-sm text-red-500">{errors.contact.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="Enter full address"
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Parent/Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                <Input
                  id="parentName"
                  {...register("parentName")}
                  placeholder="Enter parent/guardian name"
                />
                {errors.parentName && (
                  <p className="text-sm text-red-500">{errors.parentName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentContact">Parent/Guardian Contact *</Label>
                <Input
                  id="parentContact"
                  {...register("parentContact")}
                  placeholder="Enter parent/guardian contact"
                />
                {errors.parentContact && (
                  <p className="text-sm text-red-500">{errors.parentContact.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isSubmitting}
            >
              Reset Form
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Admit Student"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
