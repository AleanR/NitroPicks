function App() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="black"
                viewBox="0 0 24 24"
                className="w-8 h-8"
              >
                <path d="M13 2L3 14h7v8l10-12h-7z" />
              </svg>
            </div>
            <h1 className="text-5xl font-extrabold">NitroPicks</h1>
          </div>
          <p className="text-gray-400 text-center">
            Make predictions, win points, compete with Knights
          </p>
        </div>

        <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">UCF Email</label>
              <input
                type="email"
                placeholder="knights@ucf.edu"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-yellow-400 text-black font-semibold py-3 hover:brightness-95 transition"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center">
            <button className="text-yellow-400 font-semibold hover:underline">
              Need an account? Sign up
            </button>
          </div>

          <div className="mt-8 border-t border-zinc-800 pt-6">
            <p className="text-center text-sm text-gray-500 leading-6">
              Simulated betting for UCF games only. Use virtual points, compete
              with friends, climb leaderboards, and redeem rewards for campus
              perks.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App