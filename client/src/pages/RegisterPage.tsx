import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const UCF_MAJORS = [
  'Accounting', 'Aerospace Engineering', 'African American Studies',
  'Agricultural Economics', 'Anthropology', 'Applied Mathematics',
  'Architecture', 'Art History', 'Biochemistry', 'Biology',
  'Biomedical Engineering', 'Business Administration', 'Chemical Engineering',
  'Chemistry', 'Civil Engineering', 'Communication Sciences and Disorders',
  'Computer Engineering', 'Computer Science', 'Construction Engineering',
  'Criminal Justice', 'Cybersecurity', 'Data Analytics', 'Digital Media',
  'Early Childhood Education', 'Economics', 'Electrical Engineering',
  'Elementary Education', 'Emergency Management', 'Engineering Technology',
  'English', 'Environmental Engineering', 'Environmental Studies', 'Finance',
  'Forensic Science', 'Game Design', 'General Business', 'Geography',
  'Health Sciences', 'History', 'Hospitality Management', 'Human Communication',
  'Industrial Engineering', 'Information Technology', 'Interdisciplinary Studies',
  'International and Global Studies', 'Journalism', 'Kinesiology',
  'Latin American Studies', 'Legal Studies', 'Liberal Studies', 'Management',
  'Management Information Systems', 'Marketing', 'Mathematics',
  'Mechanical Engineering', 'Medical Laboratory Sciences', 'Microbiology',
  'Music', 'Nursing', 'Nutrition and Dietetics', 'Philosophy', 'Photography',
  'Physics', 'Political Science', 'Psychology', 'Public Administration',
  'Public Health', 'Real Estate', 'Religious Studies', 'Social Work',
  'Sociology', 'Software Engineering', 'Statistics', 'Studio Art',
  'Supply Chain Management', 'Theatre', 'Urban and Regional Planning',
  "Women's and Gender Studies", 'Writing and Rhetoric',
]

type FieldErrors = Partial<Record<
  'firstname' | 'lastname' | 'username' | 'ucfID' | 'major' | 'email' | 'password' | 'confirmPassword',
  string
>>

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs transition ${met ? 'text-green-400' : 'text-zinc-500'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
        {met ? (
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        ) : (
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        )}
      </svg>
      {label}
    </li>
  )
}

function RegisterPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstname: '', lastname: '', username: '',
    ucfID: '', major: '', email: '', password: '', confirmPassword: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)

  const pw = formData.password
  const pwReqs = {
    length: pw.length >= 8,
  }
  const pwValid = pwReqs.length

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
    setServerError('')
  }

  const validate = (): FieldErrors => {
    const e: FieldErrors = {}
    if (!formData.firstname.trim()) e.firstname = 'First name is required.'
    if (!formData.lastname.trim()) e.lastname = 'Last name is required.'
    if (!formData.username.trim()) e.username = 'Username is required.'
    if (!formData.ucfID.trim()) {
      e.ucfID = 'UCF ID is required.'
    } else if (!/^\d{7}$/.test(formData.ucfID.trim())) {
      e.ucfID = 'UCF ID must be 7 digits.'
    }
    if (!formData.major) e.major = 'Please select your major.'
    if (!formData.email.trim()) {
      e.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      e.email = 'Enter a valid email address.'
    }
    if (!formData.password) {
      e.password = 'Password is required.'
    } else if (!pwValid) {
      e.password = 'Password does not meet requirements.'
    }
    if (!formData.confirmPassword) {
      e.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      e.confirmPassword = 'Passwords do not match.'
    }
    return e
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setServerError('')
    setLoading(true)

    try {
      const { confirmPassword, ...payload } = formData
      const response = await fetch('/api/users/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || `Registration failed (${response.status})`)
      }

      setSuccess(true)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: keyof FieldErrors) =>
    `w-full rounded-xl border px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-yellow-400 ${
      errors[field] ? 'border-red-500/60 bg-red-500/5' : 'border-zinc-700 bg-zinc-900'
    }`

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" className="w-8 h-8">
                <path d="M13 2L3 14h7v8l10-12h-7z" />
              </svg>
            </div>
            <h1 className="text-5xl font-extrabold">NitroPicks</h1>
          </div>
          <p className="text-zinc-400 text-center text-sm">
            Make predictions, win points, compete with Knights
          </p>
        </div>

        <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-8 shadow-2xl">

          {success ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-yellow-400">
                  <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                  <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Check your inbox</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We sent a verification link to <span className="font-semibold text-white">{formData.email}</span>.
                Click it to activate your account before signing in.
              </p>
              <p className="text-xs text-zinc-500">Didn't get it? Check your spam folder.</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-2 w-full rounded-xl bg-yellow-400 py-3 font-bold text-black hover:bg-yellow-300 transition"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            /* ── Registration form ── */
            <>
              <h2 className="text-xl font-bold text-white mb-6">Create Account</h2>

              {serverError && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-red-400">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-400">{serverError}</p>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">First Name</label>
                    <input name="firstname" type="text" value={formData.firstname} onChange={handleChange} className={inputClass('firstname')} />
                    {errors.firstname && <p className="mt-1 text-xs text-red-400">{errors.firstname}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Last Name</label>
                    <input name="lastname" type="text" value={formData.lastname} onChange={handleChange} className={inputClass('lastname')} />
                    {errors.lastname && <p className="mt-1 text-xs text-red-400">{errors.lastname}</p>}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Username</label>
                  <input name="username" type="text" value={formData.username} onChange={handleChange} className={inputClass('username')} />
                  {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
                </div>

                {/* UCF ID */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">UCF ID</label>
                  <input name="ucfID" type="text" placeholder="7-digit student ID" maxLength={7} value={formData.ucfID} onChange={handleChange} className={inputClass('ucfID')} />
                  {errors.ucfID && <p className="mt-1 text-xs text-red-400">{errors.ucfID}</p>}
                </div>

                {/* Major dropdown */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Major</label>
                  <select
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-yellow-400 appearance-none ${
                      errors.major ? 'border-red-500/60 bg-red-500/5 text-white' : 'border-zinc-700 bg-zinc-900 text-white'
                    } ${!formData.major ? 'text-zinc-500' : 'text-white'}`}
                  >
                    <option value="" disabled className="text-zinc-500 bg-zinc-900">Select your major</option>
                    {UCF_MAJORS.map((m) => (
                      <option key={m} value={m} className="bg-zinc-900 text-white">{m}</option>
                    ))}
                  </select>
                  {errors.major && <p className="mt-1 text-xs text-red-400">{errors.major}</p>}
                </div>

                {/* UCF Email */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">UCF Email</label>
                  <input name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className={inputClass('email')} />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className={`${inputClass('password')} pr-11`}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition">
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {/* Password requirements */}
                  {formData.password && (
                    <ul className="mt-2">
                      <PasswordRequirement met={pwReqs.length} label="At least 8 characters" />
                    </ul>
                  )}
                  {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`${inputClass('confirmPassword')} pr-11`}
                    />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition">
                      {showConfirm ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-yellow-400 text-black font-bold py-3 hover:bg-yellow-300 transition disabled:opacity-60 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Creating Account…
                    </span>
                  ) : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-yellow-400 font-semibold hover:underline">
                  Already have an account? Sign in
                </Link>
              </div>

              <div className="mt-6 border-t border-zinc-800 pt-5">
                <p className="text-center text-xs text-zinc-500 leading-5">
                  Simulated betting for UCF games only. Use virtual points, compete
                  with friends, climb leaderboards, and redeem rewards for campus perks.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
