import { useEffect, useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';


const MODIFIER_TABLE = [ -5, -5, -4, -4, -3, -3, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5]

export function calculateModifier(point) {
    return MODIFIER_TABLE[Math.min(point, 20)]
}

const DEFAULT_ATTRIBUTE_POINTS = {
  'Strength': 10,
  'Dexterity': 10,
  'Constitution': 10,
  'Intelligence': 10,
  'Wisdom': 10,
  'Charisma': 10,
}

const DEFAULT_SKILL_POINTS = {
  'Acrobatics': 0,
  'Animal Handling': 0,
  'Arcana': 0,
  'Athletics': 0,
  'Deception': 0,
  'History': 0,
  'Insight': 0,
  'Intimidation': 0,
  'Investigation': 0,
  'Medicine': 0,
  'Nature': 0,
  'Perception': 0,
  'Performance': 0,
  'Persuasion': 0,
  'Religion': 0,
  'Sleight of Hand': 0,
  'Stealth': 0,
  'Survival': 0,
}

const ATTRIBUTE_MAX_POINT = 70

function App() {
  const [attributePoints, setAttributePoints] = useState(null);

  const [showClassRequirements, setShowClassRequirements] = useState(null)

  const [skillPoints, setSkillPoints] = useState(null)

  useEffect(() => {
    loadData().then()
  }, [])


  function incrementAttribute(attributeName, increment) {
    const newValues = {
      ...attributePoints
    }

    const value = newValues[attributeName] + increment
    if (value < 0 || value > 20) {
      return
    }
    newValues[attributeName] = value;

    let total = 0
    for (const name of ATTRIBUTE_LIST) {
      total += newValues[name]
    }

    console.log(total)
    if (total > ATTRIBUTE_MAX_POINT) {
      return;
    }

    setAttributePoints(newValues)
  }

  function getAttributeElement() {
    return ATTRIBUTE_LIST.map((attributeName) => {
      const point = attributePoints[attributeName]
      return (
        <div>
            <div>
              {attributeName}: {point} &#40;Modifier: {calculateModifier(point)}&#41;
              <button onClick={() => incrementAttribute(attributeName, 1)}>+</button>
              <button onClick={() => incrementAttribute(attributeName, -1)}>-</button>
            </div>
        </div>
      )
    })
  }

  function isValidClass(className) {
    const requirements = CLASS_LIST[className] 

    for (const attributeName of ATTRIBUTE_LIST) {
      if (attributePoints[attributeName] < requirements[attributeName]) {
        return false
      }
    }

    return true
  }

  function getClasses() {
    return Object.keys(CLASS_LIST).map(className => {
      return (
        <div style={{color: isValidClass(className) ? 'white' : 'red'}} onClick={() => setShowClassRequirements(className)}>
          {className}
        </div>
      )
    })
  }

  function showRequirementsPanel() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h2>Classes &#40;{showClassRequirements}&#41;:</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>Strength: { CLASS_LIST[showClassRequirements].Strength }</div>
            <div>Dexterity: { CLASS_LIST[showClassRequirements].Dexterity }</div>
            <div>Constitution: { CLASS_LIST[showClassRequirements].Constitution }</div>
            <div>Intelligence: { CLASS_LIST[showClassRequirements].Intelligence }</div>
            <div>Wisdom: { CLASS_LIST[showClassRequirements].Wisdom }</div>
            <div>Charisma: { CLASS_LIST[showClassRequirements].Charisma }</div>
            <button onClick={() => setShowClassRequirements(null) }>Close Requirements</button>
        </div>
    </div>
    )
  }

  function getSkills() {
    return SKILL_LIST.map((skill) => {
      const skillPoint = skillPoints[skill.name]
      const modifier = calculateModifier(attributePoints[skill.attributeModifier])

      return (
        <div>
          {skill.name} - point: {skillPoint}
          &nbsp;<button onClick={() => incrementSkill(skill, 1)}>+</button>
          &nbsp;<button onClick={() => incrementSkill(skill, -1)}>-</button>
          &nbsp;- modifier &#40;{skill.attributeModifier}&#41;: {modifier}
          &nbsp;- Total: {skillPoint + modifier}
        </div>
      )
    })
  }

  function canAllocateSkillPoint(attributeName, newSkillPoints) {
    const modifier = calculateModifier(attributePoints[attributeName])
    const pointMax = 10 + 4 * modifier

    let totalPoint = 0
    for (const skill of SKILL_LIST.filter(s => s.attributeModifier === attributeName)) {
      totalPoint += newSkillPoints[skill.name]
    }

    return totalPoint <= pointMax
  }

  function incrementSkill(skill, increment) {
    const newValues = {
      ...skillPoints
    }

    const value = newValues[skill.name] + increment
    if (value < 0) {
      return
    }
    newValues[skill.name] = value;

    if (!canAllocateSkillPoint(skill.attributeModifier, newValues)) {
      return;
    }

    setSkillPoints(newValues)
  }

  async function saveData() {
    const body = {
      attributePoints: attributePoints,
      skillPoints: skillPoints,
    }

    console.log("Save: ", JSON.stringify(body, null, 4));

    await fetch('https://recruiting.verylongdomaintotestwith.ca/api/{dootyonn}/character', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    })

  }

  async function loadData() {
    const result = await fetch('https://recruiting.verylongdomaintotestwith.ca/api/{dootyonn}/character');
    if (!result.ok) {
        return null
    }

    const data = await result.json()
    console.log("Load: ", data)

    if (data?.message === "Item not found") {
        return null;
    }

    setAttributePoints(data?.body?.attributePoints ?? DEFAULT_ATTRIBUTE_POINTS)
    setSkillPoints(data?.body?.skillPoints ?? DEFAULT_SKILL_POINTS)
  }

  if (attributePoints === null || skillPoints === null) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>React Coding Exercise</h1>
        </header>
        <section className="App-section">
          <h2>Loading...</h2>
        </section>
      </div>
    )
  }
  else {
    return (
      <div className="App">
        <header className="App-header">
          <h1>React Coding Exercise</h1>
        </header>
        <section className="App-section">
          <div className='root' style={{display:'flex', flexDirection: 'column', gap: 50}}>
            <div className='sections' style={{display:'flex', flexDirection: 'row', gap: 50}}>

              <div className='Attributes'>
                <h2>Attributes:</h2>
                {getAttributeElement()}
              </div>
            
              <div className='Classes' style={{display:'flex', flexDirection: 'row', gap: 50}}>
                <div  style={{display:'flex', flexDirection: 'column' }}>
                  <h2>Classes: </h2>
                  {getClasses()}
                </div>
                { showClassRequirements != null ? showRequirementsPanel() : null }
              </div>

              <div className='Skills' style={{display:'flex', flexDirection: 'column'}}>
                <h2>Skills</h2>
                {getSkills()}
              </div>

            </div>

            <button onClick={() => {
              (async() => { await saveData() })()
            }}>Save</button>
          </div>
        </section>
      </div>
    );
  }
}

export default App;
