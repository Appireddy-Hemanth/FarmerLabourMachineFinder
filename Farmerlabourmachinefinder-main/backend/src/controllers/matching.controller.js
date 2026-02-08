const Job = require('../models/Job.model');
const User = require('../models/User.model');

function scoreMatch(job, user) {
  let score = 0;
  const reasons = [];

  if (user.location && job.location && user.location.toLowerCase() === job.location.toLowerCase()) {
    score += 45;
    reasons.push('Location proximity');
  }

  if (user.skills && user.skills.length > 0) {
    const skillHit = user.skills.some(s => job.workType.toLowerCase().includes(s.toLowerCase()));
    if (skillHit) {
      score += 35;
      reasons.push('Skill relevance');
    }
  }

  if (user.availability) {
    score += 20;
    reasons.push('Availability');
  }

  return { score: Math.min(98, score || 30), reasons };
}

async function getMatches(req, res) {
  const { jobId } = req.params;
  const job = await Job.findById(jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  const labourers = await User.find({ role: 'Labour' }).select('-passwordHash');
  const suggestions = labourers.map(l => {
    const { score, reasons } = scoreMatch(job, l);
    return {
      id: l._id,
      name: l.name,
      location: l.location,
      skills: l.skills,
      availability: l.availability,
      matchPercent: score,
      reasons
    };
  }).sort((a, b) => b.matchPercent - a.matchPercent);

  return res.json({ jobId, suggestions });
}

module.exports = { getMatches };
