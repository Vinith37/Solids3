"""
Materials database — standard engineering materials with mechanical properties.
"""

materials_db = [
    # Metals
    {"name": "Steel (AISI 1020)", "category": "Metals", "density": 7850, "modulus": 200, "strength": 350, "poisson": 0.29, "thermalExpansion": 11.7, "cost": 0.8},
    {"name": "Steel (AISI 4140)", "category": "Metals", "density": 7850, "modulus": 205, "strength": 655, "poisson": 0.29, "thermalExpansion": 12.3, "cost": 1.2},
    {"name": "Aluminum (6061-T6)", "category": "Metals", "density": 2700, "modulus": 70, "strength": 270, "poisson": 0.33, "thermalExpansion": 23.6, "cost": 2.5},
    {"name": "Aluminum (7075-T6)", "category": "Metals", "density": 2810, "modulus": 71, "strength": 503, "poisson": 0.33, "thermalExpansion": 23.2, "cost": 4.5},
    {"name": "Titanium (Ti-6Al-4V)", "category": "Metals", "density": 4430, "modulus": 114, "strength": 880, "poisson": 0.34, "thermalExpansion": 8.6, "cost": 30},
    {"name": "Copper (C11000)", "category": "Metals", "density": 8960, "modulus": 115, "strength": 220, "poisson": 0.34, "thermalExpansion": 16.9, "cost": 8},
    {"name": "Magnesium Alloy (AZ31B)", "category": "Metals", "density": 1800, "modulus": 45, "strength": 200, "poisson": 0.35, "thermalExpansion": 26, "cost": 3.5},
    {"name": "Nickel Alloy (Inconel 718)", "category": "Metals", "density": 8190, "modulus": 200, "strength": 1035, "poisson": 0.3, "thermalExpansion": 13, "cost": 45},
    # Composites
    {"name": "CFRP (High Modulus)", "category": "Composites", "density": 1600, "modulus": 200, "strength": 1200, "poisson": 0.3, "thermalExpansion": -0.5, "cost": 80},
    {"name": "CFRP (Standard)", "category": "Composites", "density": 1550, "modulus": 135, "strength": 900, "poisson": 0.3, "thermalExpansion": 0.1, "cost": 50},
    {"name": "GFRP (E-glass)", "category": "Composites", "density": 2000, "modulus": 45, "strength": 1000, "poisson": 0.25, "thermalExpansion": 6, "cost": 15},
    {"name": "KFRP (Kevlar 49)", "category": "Composites", "density": 1380, "modulus": 75, "strength": 1400, "poisson": 0.34, "thermalExpansion": -2, "cost": 40},
    # Polymers
    {"name": "Polycarbonate", "category": "Polymers", "density": 1200, "modulus": 2.4, "strength": 70, "poisson": 0.37, "thermalExpansion": 65, "cost": 4},
    {"name": "ABS", "category": "Polymers", "density": 1050, "modulus": 2.3, "strength": 40, "poisson": 0.35, "thermalExpansion": 90, "cost": 2},
    {"name": "Nylon 6,6", "category": "Polymers", "density": 1140, "modulus": 3.0, "strength": 80, "poisson": 0.4, "thermalExpansion": 80, "cost": 3},
    {"name": "Polyethylene (HDPE)", "category": "Polymers", "density": 950, "modulus": 0.8, "strength": 25, "poisson": 0.42, "thermalExpansion": 120, "cost": 1.5},
    {"name": "Polypropylene", "category": "Polymers", "density": 900, "modulus": 1.4, "strength": 35, "poisson": 0.42, "thermalExpansion": 150, "cost": 1.2},
    # Ceramics
    {"name": "Silicon Carbide", "category": "Ceramics", "density": 3100, "modulus": 450, "strength": 600, "poisson": 0.14, "thermalExpansion": 4, "cost": 50},
    {"name": "Alumina", "category": "Ceramics", "density": 3900, "modulus": 380, "strength": 300, "poisson": 0.22, "thermalExpansion": 8.1, "cost": 20},
    {"name": "Silicon Nitride", "category": "Ceramics", "density": 3200, "modulus": 310, "strength": 800, "poisson": 0.24, "thermalExpansion": 3.2, "cost": 60},
    {"name": "Zirconia", "category": "Ceramics", "density": 5800, "modulus": 210, "strength": 900, "poisson": 0.3, "thermalExpansion": 10.5, "cost": 40},
    {"name": "Glass (Soda-lime)", "category": "Ceramics", "density": 2500, "modulus": 70, "strength": 50, "poisson": 0.22, "thermalExpansion": 9, "cost": 1},
    # Natural Materials
    {"name": "Oak Wood", "category": "Natural", "density": 750, "modulus": 12, "strength": 50, "poisson": 0.3, "thermalExpansion": 5, "cost": 1.5},
    {"name": "Balsa Wood", "category": "Natural", "density": 150, "modulus": 3, "strength": 10, "poisson": 0.3, "thermalExpansion": 5, "cost": 10},
    {"name": "Bamboo", "category": "Natural", "density": 700, "modulus": 20, "strength": 100, "poisson": 0.3, "thermalExpansion": 4, "cost": 2},
    {"name": "Cork", "category": "Natural", "density": 160, "modulus": 0.05, "strength": 1.5, "poisson": 0, "thermalExpansion": 180, "cost": 5},
    # Foams & Porous
    {"name": "Aluminum Foam", "category": "Foams", "density": 500, "modulus": 5, "strength": 2, "poisson": 0.3, "thermalExpansion": 23, "cost": 15},
    {"name": "Polyurethane Foam (Rigid)", "category": "Foams", "density": 50, "modulus": 0.05, "strength": 0.5, "poisson": 0.3, "thermalExpansion": 50, "cost": 3},
    {"name": "Aerogel (Silica)", "category": "Foams", "density": 100, "modulus": 0.001, "strength": 0.1, "poisson": 0.2, "thermalExpansion": 3, "cost": 200},
]
