import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  LayoutTemplate,
  Plus,
  Rocket,
  Search,
  Sparkles
} from 'lucide-react'
import { serverUrl } from '../App'

const Dashboard = () => {
  const { userData } = useSelector((state) => state.user)
  const navigate = useNavigate()

  const [websites, setWebsites] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [deployingId, setDeployingId] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const getAllWebsites = async () => {
      setLoading(true)
      setFetchError('')
      try {
        const response = await axios.get(`${serverUrl}/api/website/get-all`, {
          withCredentials: true
        })
        setWebsites(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('Error fetching websites:', error)
        
        const status = error.response?.status
        const code = error.response?.data?.code
        
        if (status === 401) {
          setFetchError('Session expired. Please login again.')
          navigate('/auth')
        } else if (status === 400 && code === 'NO_TOKEN') {
          setFetchError('Please login to view your websites.')
          navigate('/auth')
        } else {
          setFetchError(error?.response?.data?.message || 'Failed to fetch websites')
        }
      } finally {
        setLoading(false)
      }
    }

    if (userData) {
      getAllWebsites()
    } else {
      navigate('/')
    }
  }, [userData, navigate])

  const stats = useMemo(() => {
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    const sevenDays = 7 * oneDay

    const createdToday = websites.filter((site) => {
      const createdAt = new Date(site?.createdAt || 0).getTime()
      return now - createdAt <= oneDay
    }).length

    const updatedThisWeek = websites.filter((site) => {
      const updatedAt = new Date(site?.updatedAt || 0).getTime()
      return now - updatedAt <= sevenDays
    }).length

    const latestUpdateTime =
      websites.length > 0
        ? websites.reduce((latest, site) => {
            const t = new Date(site?.updatedAt || 0).getTime()
            return t > latest ? t : latest
          }, 0)
        : 0

    return {
      total: websites.length,
      createdToday,
      updatedThisWeek,
      latestUpdateTime
    }
  }, [websites])

  const visibleWebsites = useMemo(() => {
    const now = Date.now()
    const sevenDays = 7 * 24 * 60 * 60 * 1000

    const filtered = websites.filter((site) => {
      if (activeFilter === 'recent') {
        const updatedAt = new Date(site?.updatedAt || 0).getTime()
        return now - updatedAt <= sevenDays
      }
      return true
    })

    const query = search.trim().toLowerCase()
    if (!query) return filtered

    return filtered.filter((site) => {
      const title = (site?.title || '').toLowerCase()
      const slug = (site?.slug || '').toLowerCase()
      return title.includes(query) || slug.includes(query)
    })
  }, [websites, activeFilter, search])

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A'
    return new Date(dateValue).toLocaleString()
  }

  const handleDeployWebsite = async (siteId) => {
    setActionMessage('')
    setActionError('')
    setDeployingId(siteId)
    try {
      const response = await axios.post(
        `${serverUrl}/api/website/deploy/${siteId}`,
        {},
        { withCredentials: true }
      )

      const deployURL = response?.data?.deployURL || ''
      setWebsites((prev) =>
        prev.map((site) =>
          site._id === siteId
            ? { ...site, deployed: true, deployURL }
            : site
        )
      )
      setActionMessage('Website deployed successfully.')
    } catch (error) {
      console.error('Deploy website error:', error)
      setActionError(error?.response?.data?.message || 'Failed to deploy website')
    } finally {
      setDeployingId('')
    }
  }

  return (
    <div className='relative min-h-screen bg-[#050505] text-white overflow-x-hidden'>
      <AnimatedBackground />

      <div className='sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <motion.button
              className='p-2 rounded-lg hover:bg-white/10 transition'
              onClick={() => navigate('/')}
              whileHover={{ x: -2, scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
            >
              <ArrowLeft size={16} />
            </motion.button>
            <h1 className='text-lg font-semibold'>Dashboard</h1>
          </div>

          <div className='flex gap-3'>
            <motion.button
              className='px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-semibold flex items-center gap-2'
              onClick={() => navigate('/ai-studio')}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
            >
              <Sparkles size={14} />
              AI Studio
            </motion.button>
            <motion.button
              className='px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold flex items-center gap-2'
              onClick={() => navigate('/generate')}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
            >
              <Plus size={14} />
              New Website
            </motion.button>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-10'>
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className='relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 mb-8'
        >
          <motion.div
            className='absolute -top-12 -right-12 w-44 h-44 rounded-full bg-cyan-400/20 blur-3xl'
            animate={{ scale: [1, 1.15, 1], x: [0, 8, 0], y: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className='absolute -bottom-16 left-10 w-56 h-56 rounded-full bg-fuchsia-400/20 blur-3xl'
            animate={{ scale: [1.1, 1, 1.1], x: [0, -10, 0], y: [0, 8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className='relative z-10'
            initial='hidden'
            animate='visible'
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
          >
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 }
              }}
              className='text-sm text-zinc-300 mb-2'
            >
              Welcome back
            </motion.p>
            <motion.h2
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 }
              }}
              className='text-3xl md:text-4xl font-bold leading-tight'
            >
              {userData?.name || 'Creator'}, your AI website control center
            </motion.h2>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 }
              }}
              className='text-zinc-300 mt-3 max-w-2xl'
            >
              Track every generated project, jump into editing instantly, and keep shipping fast.
            </motion.p>
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'
        >
          {[
            {
              label: 'Total Websites',
              value: stats.total,
              icon: LayoutTemplate
            },
            {
              label: 'Created Today',
              value: stats.createdToday,
              icon: Sparkles
            },
            {
              label: 'Updated This Week',
              value: stats.updatedThisWeek,
              icon: CalendarDays
            }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 + index * 0.08 }}
              whileHover={{ y: -5, scale: 1.01 }}
              className='relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5'
            >
              <motion.div
                className='absolute inset-0 opacity-0 hover:opacity-100 transition pointer-events-none'
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{
                  background:
                    'linear-gradient(120deg, rgba(56,189,248,0.08), rgba(217,70,239,0.08), rgba(34,197,94,0.08))',
                  backgroundSize: '200% 200%'
                }}
              />
              <div className='relative z-10 flex items-start justify-between'>
                <div>
                  <p className='text-xs text-zinc-400'>{item.label}</p>
                  <motion.p
                    key={item.value}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='text-3xl font-bold mt-2'
                  >
                    {item.value}
                  </motion.p>
                </div>
                <item.icon size={18} className='text-zinc-300' />
              </div>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className='rounded-2xl border border-white/10 bg-white/5 p-4 mb-6'
        >
          <div className='flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between'>
            <div className='relative w-full lg:max-w-md'>
              <Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400' />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search by title or slug...'
                className='w-full h-11 pl-10 pr-4 rounded-xl border border-white/10 bg-black/30 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40'
              />
            </div>

            <div className='flex items-center gap-2'>
              {[
                { id: 'all', label: 'All Websites' },
                { id: 'recent', label: 'Updated in 7d' }
              ].map((filter) => (
                <motion.button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 h-10 rounded-xl text-sm border transition ${
                    activeFilter === filter.id
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent border-white/15 text-zinc-300 hover:bg-white/10'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {filter.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.section>

        {!!actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className='rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 mb-5 text-sm text-emerald-200'
          >
            {actionMessage}
          </motion.div>
        )}

        {!!actionError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className='rounded-xl border border-red-400/30 bg-red-500/10 p-3 mb-5 text-sm text-red-200'
          >
            {actionError}
          </motion.div>
        )}

        {loading && <LoadingState />}

        {!loading && fetchError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-red-200'
          >
            {fetchError}
          </motion.div>
        )}

        {!loading && !fetchError && visibleWebsites.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='rounded-2xl border border-white/10 bg-white/5 p-10 text-center'
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className='w-14 h-14 rounded-full border-2 border-cyan-300/40 border-t-cyan-300 mx-auto mb-4'
            />
            <p className='text-zinc-200 text-lg font-medium'>No websites found</p>
            <p className='text-zinc-400 text-sm mt-1'>
              Start your first project and it will appear here.
            </p>
            <motion.button
              className='mt-5 px-4 py-2 bg-white text-black rounded-lg font-semibold text-sm'
              onClick={() => navigate('/generate')}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
            >
              Generate Website
            </motion.button>
          </motion.div>
        )}

        {!loading && !fetchError && visibleWebsites.length > 0 && (
          <motion.div
            layout
            className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
          >
            <AnimatePresence mode='popLayout'>
              {visibleWebsites.map((site, index) => (
                <motion.div
                  layout
                  key={site._id}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.28, delay: index * 0.04 }}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className='group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] text-left p-4'
                >
                  <motion.div
                    className='pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100'
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    style={{
                      background:
                        'conic-gradient(from 180deg at 50% 50%, rgba(56,189,248,0.22), rgba(244,114,182,0.18), rgba(34,197,94,0.18), rgba(56,189,248,0.22))',
                      filter: 'blur(40px)'
                    }}
                  />

                  <div className='relative z-10'>
                    <div className='rounded-xl overflow-hidden border border-white/15 bg-black/40 h-44 mb-4'>
                      <iframe
                        srcDoc={site?.latestCode || ''}
                        title={`preview-${site?._id}`}
                        className='w-full h-full bg-white pointer-events-none'
                      />
                    </div>

                    <div className='flex items-start justify-between gap-3'>
                      <h3 className='text-lg font-semibold line-clamp-2'>
                        {site?.title || 'Untitled Website'}
                      </h3>
                      <span
                        className={`text-[10px] uppercase tracking-wide border rounded-full px-2 py-1 ${
                          site?.deployed
                            ? 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10'
                            : 'text-zinc-400 border-white/10'
                        }`}
                      >
                        {site?.deployed ? 'Live' : 'Draft'}
                      </span>
                    </div>

                    <p className='text-xs text-zinc-400 mt-2 line-clamp-1'>
                      {site?.slug || 'no-slug'}
                    </p>

                    <div className='mt-5 space-y-2 text-xs text-zinc-300'>
                      <div className='flex items-center gap-2'>
                        <Clock3 size={13} className='text-zinc-400' />
                        <span>Updated: {formatDate(site?.updatedAt)}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <CalendarDays size={13} className='text-zinc-400' />
                        <span>Created: {formatDate(site?.createdAt)}</span>
                      </div>
                    </div>

                    <div className='mt-4 grid grid-cols-2 gap-2'>
                      <motion.button
                        onClick={() => navigate(`/editor/${site._id}`)}
                        className='h-10 rounded-lg bg-white text-black text-sm font-semibold'
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        Open Editor
                      </motion.button>

                      <motion.button
                        onClick={() => handleDeployWebsite(site._id)}
                        className='h-10 rounded-lg border border-cyan-300/40 text-cyan-200 text-sm font-semibold flex items-center justify-center gap-2 bg-cyan-400/10'
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        disabled={deployingId === site._id}
                      >
                        <Rocket size={14} />
                        {deployingId === site._id ? 'Deploying...' : 'Deploy'}
                      </motion.button>
                    </div>

                    {site?.deployed && site?.deployURL && (
                      <motion.button
                        onClick={() => window.open(site.deployURL, '_blank', 'noopener,noreferrer')}
                        className='mt-2 w-full h-9 rounded-lg border border-emerald-300/40 text-emerald-200 text-sm font-medium flex items-center justify-center gap-2 bg-emerald-500/10'
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <ExternalLink size={14} />
                        Open Live URL
                      </motion.button>
                    )}

                    <motion.div
                      className='mt-5 h-1.5 rounded-full bg-white/10 overflow-hidden'
                      initial={{ width: '100%' }}
                    >
                      <motion.div
                        className='h-full bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-green-300'
                        animate={{ x: ['-40%', '40%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                        style={{ width: '60%' }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='text-xs text-zinc-500 mt-8 flex items-center gap-2'
        >
          <Sparkles size={12} />
          Last dashboard refresh: {stats.latestUpdateTime ? formatDate(stats.latestUpdateTime) : 'N/A'}
        </motion.p>
      </div>
    </div>
  )
}

export default Dashboard

function AnimatedBackground() {
  return (
    <div className='pointer-events-none fixed inset-0 -z-10 overflow-hidden'>
      <motion.div
        className='absolute top-[-120px] left-[-80px] w-[380px] h-[380px] rounded-full bg-cyan-400/20 blur-[120px]'
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className='absolute bottom-[-160px] right-[-60px] w-[420px] h-[420px] rounded-full bg-fuchsia-500/20 blur-[130px]'
        animate={{ x: [0, -40, 0], y: [0, -30, 0], scale: [1.08, 1, 1.08] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className='absolute top-[40%] left-[45%] w-[260px] h-[260px] rounded-full bg-emerald-400/15 blur-[110px]'
        animate={{ x: [0, 35, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function LoadingState() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.28, 0.62, 0.28] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.08 }}
          className='rounded-2xl border border-white/10 bg-white/5 p-5 h-44'
        >
          <div className='h-4 w-2/3 rounded bg-white/10 mb-3' />
          <div className='h-3 w-1/2 rounded bg-white/10 mb-8' />
          <div className='h-3 w-full rounded bg-white/10 mb-2' />
          <div className='h-3 w-4/5 rounded bg-white/10 mb-2' />
          <div className='h-3 w-3/5 rounded bg-white/10' />
        </motion.div>
      ))}
    </div>
  )
}
