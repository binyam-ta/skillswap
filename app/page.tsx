import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 flex flex-col items-start">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Share Skills, Grow Together</h1>
            <p className="text-xl mb-8">Exchange your expertise with others in a community-based platform. Teach what you know, learn what you don't.</p>
            <div className="flex space-x-4">
              <Link href="/auth/signup" className="bg-white text-primary-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition duration-300">
                Get Started
              </Link>
              <Link href="/skills/browse" className="border border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-primary-600 transition duration-300">
                Find a Skill Swap
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
            <div className="relative w-full max-w-md h-64 md:h-96">
              <div className="absolute top-0 right-0 bg-white rounded-lg shadow-xl p-4 w-40 h-40">
                <div className="text-primary-600 font-bold">Web Development</div>
                <div className="text-gray-600 text-sm">Offering</div>
              </div>
              <div className="absolute bottom-0 left-0 bg-white rounded-lg shadow-xl p-4 w-40 h-40">
                <div className="text-secondary-600 font-bold">Guitar Lessons</div>
                <div className="text-gray-600 text-sm">Looking for</div>
              </div>
              <div className="absolute top-1/3 left-1/4 bg-white rounded-lg shadow-xl p-4 w-40 h-40">
                <div className="text-primary-600 font-bold">Photography</div>
                <div className="text-gray-600 text-sm">Offering</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 text-primary-600 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">Sign up and list the skills you can offer and the ones you want to learn.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 text-primary-600 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Your Match</h3>
              <p className="text-gray-600">Search for users who offer what you need and need what you offer.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 text-primary-600 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Swapping</h3>
              <p className="text-gray-600">Connect, schedule sessions, and exchange skills with your new partner.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Skills */}
      <section className="w-full py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Skills Being Swapped</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Web Development', 'Language Learning', 'Photography', 'Cooking', 'Graphic Design', 'Music Production', 'Fitness Training', 'Financial Planning'].map((skill, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
                <div className="text-lg font-semibold text-gray-800">{skill}</div>
                <div className="text-sm text-gray-500 mt-2">
                  {Math.floor(Math.random() * 100) + 20} active swappers
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Web Developer',
                quote: 'I taught JavaScript and learned photography in return. The platform made it easy to find the perfect match for my skills.',
              },
              {
                name: 'Michael Chen',
                role: 'Language Teacher',
                quote: 'Teaching Mandarin and learning guitar has been a rewarding experience. I\'ve made great connections through SkillSwap.',
              },
              {
                name: 'Emma Rodriguez',
                role: 'Graphic Designer',
                quote: 'The skill exchange model is brilliant! I improved my design portfolio while learning cooking from a professional chef.',
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <span className="text-gray-500 text-xl font-bold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Swapping Skills?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join our community today and start exchanging knowledge with people around the world.</p>
          <Link href="/auth/signup" className="bg-white text-primary-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition duration-300 inline-block">
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="text-2xl font-bold mb-2">SkillSwap</div>
              <p className="text-gray-400">Exchange skills, grow together.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Platform</h3>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                  <li><Link href="/how-it-works" className="text-gray-400 hover:text-white">How It Works</Link></li>
                  <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
                  <li><Link href="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                  <li><Link href="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
