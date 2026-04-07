"""
Ashby chart materials — property ranges for material selection charts.
"""

ashby_materials_db = [
    # ====== METALS ======
    {"name": "Steels", "category": "Metals", "density_low": 7700, "density_high": 8100, "modulus_low": 189, "modulus_high": 215, "strength_low": 250, "strength_high": 1800},
    {"name": "Cast Irons", "category": "Metals", "density_low": 7050, "density_high": 7800, "modulus_low": 165, "modulus_high": 180, "strength_low": 200, "strength_high": 800},
    {"name": "Al alloys", "category": "Metals", "density_low": 2500, "density_high": 2900, "modulus_low": 68, "modulus_high": 82, "strength_low": 30, "strength_high": 550},
    {"name": "Ti alloys", "category": "Metals", "density_low": 4400, "density_high": 4800, "modulus_low": 90, "modulus_high": 120, "strength_low": 200, "strength_high": 1300},
    {"name": "Cu alloys", "category": "Metals", "density_low": 8200, "density_high": 9000, "modulus_low": 112, "modulus_high": 148, "strength_low": 30, "strength_high": 500},
    {"name": "Ni alloys", "category": "Metals", "density_low": 7800, "density_high": 8900, "modulus_low": 190, "modulus_high": 220, "strength_low": 70, "strength_high": 1200},
    {"name": "Mg alloys", "category": "Metals", "density_low": 1740, "density_high": 1950, "modulus_low": 42, "modulus_high": 47, "strength_low": 50, "strength_high": 280},
    {"name": "Zn alloys", "category": "Metals", "density_low": 5000, "density_high": 7200, "modulus_low": 70, "modulus_high": 80, "strength_low": 100, "strength_high": 400},
    {"name": "W alloys", "category": "Metals", "density_low": 17000, "density_high": 19300, "modulus_low": 350, "modulus_high": 410, "strength_low": 500, "strength_high": 1500},
    {"name": "Pb alloys", "category": "Metals", "density_low": 10800, "density_high": 11400, "modulus_low": 13, "modulus_high": 16, "strength_low": 10, "strength_high": 30},
    # ====== TECHNICAL CERAMICS ======
    {"name": "Alumina", "category": "Technical ceramics", "density_low": 3700, "density_high": 3990, "modulus_low": 340, "modulus_high": 390, "strength_low": 250, "strength_high": 550},
    {"name": "SiC", "category": "Technical ceramics", "density_low": 3000, "density_high": 3210, "modulus_low": 380, "modulus_high": 460, "strength_low": 200, "strength_high": 800},
    {"name": "Si3N4", "category": "Technical ceramics", "density_low": 3100, "density_high": 3300, "modulus_low": 280, "modulus_high": 320, "strength_low": 300, "strength_high": 1000},
    {"name": "WC", "category": "Technical ceramics", "density_low": 15000, "density_high": 15800, "modulus_low": 550, "modulus_high": 680, "strength_low": 300, "strength_high": 900},
    {"name": "B4C", "category": "Technical ceramics", "density_low": 2400, "density_high": 2550, "modulus_low": 420, "modulus_high": 480, "strength_low": 350, "strength_high": 500},
    # ====== NONTECHNICAL CERAMICS ======
    {"name": "Soda-lime glass", "category": "Nontechnical ceramics", "density_low": 2440, "density_high": 2550, "modulus_low": 62, "modulus_high": 72, "strength_low": 30, "strength_high": 50},
    {"name": "Borosilicate glass", "category": "Nontechnical ceramics", "density_low": 2200, "density_high": 2300, "modulus_low": 60, "modulus_high": 68, "strength_low": 20, "strength_high": 50},
    {"name": "Pottery", "category": "Nontechnical ceramics", "density_low": 1800, "density_high": 2400, "modulus_low": 15, "modulus_high": 40, "strength_low": 10, "strength_high": 50},
    {"name": "Stone", "category": "Nontechnical ceramics", "density_low": 2000, "density_high": 3000, "modulus_low": 20, "modulus_high": 80, "strength_low": 20, "strength_high": 200},
    {"name": "Concrete", "category": "Nontechnical ceramics", "density_low": 2200, "density_high": 2500, "modulus_low": 20, "modulus_high": 45, "strength_low": 15, "strength_high": 50},
    {"name": "Brick", "category": "Nontechnical ceramics", "density_low": 1800, "density_high": 2100, "modulus_low": 10, "modulus_high": 30, "strength_low": 10, "strength_high": 40},
    # ====== COMPOSITES ======
    {"name": "CFRP", "category": "Composites", "density_low": 1450, "density_high": 1650, "modulus_low": 60, "modulus_high": 250, "strength_low": 350, "strength_high": 1600},
    {"name": "GFRP", "category": "Composites", "density_low": 1700, "density_high": 2100, "modulus_low": 15, "modulus_high": 50, "strength_low": 110, "strength_high": 1050},
    {"name": "KFRP", "category": "Composites", "density_low": 1300, "density_high": 1450, "modulus_low": 25, "modulus_high": 80, "strength_low": 200, "strength_high": 800},
    # ====== POLYMERS ======
    {"name": "Polyester", "category": "Polymers", "density_low": 1040, "density_high": 1400, "modulus_low": 2, "modulus_high": 4.5, "strength_low": 36, "strength_high": 67},
    {"name": "Nylon", "category": "Polymers", "density_low": 1070, "density_high": 1170, "modulus_low": 1.2, "modulus_high": 3.3, "strength_low": 40, "strength_high": 85},
    {"name": "PC", "category": "Polymers", "density_low": 1130, "density_high": 1220, "modulus_low": 2.3, "modulus_high": 2.5, "strength_low": 55, "strength_high": 75},
    {"name": "PP", "category": "Polymers", "density_low": 890, "density_high": 910, "modulus_low": 0.8, "modulus_high": 1.5, "strength_low": 20, "strength_high": 40},
    {"name": "PE", "category": "Polymers", "density_low": 920, "density_high": 980, "modulus_low": 0.6, "modulus_high": 1.0, "strength_low": 15, "strength_high": 30},
    {"name": "Epoxies", "category": "Polymers", "density_low": 1100, "density_high": 1400, "modulus_low": 2.5, "modulus_high": 5.0, "strength_low": 30, "strength_high": 100},
    {"name": "PMMA", "category": "Polymers", "density_low": 1160, "density_high": 1200, "modulus_low": 2.4, "modulus_high": 3.3, "strength_low": 48, "strength_high": 76},
    {"name": "PVC", "category": "Polymers", "density_low": 1300, "density_high": 1450, "modulus_low": 2.4, "modulus_high": 3.0, "strength_low": 35, "strength_high": 55},
    {"name": "PTFE", "category": "Polymers", "density_low": 2100, "density_high": 2200, "modulus_low": 0.4, "modulus_high": 0.8, "strength_low": 15, "strength_high": 30},
    # ====== NATURAL MATERIALS ======
    {"name": "Wood ∥ grain", "category": "Natural materials", "density_low": 400, "density_high": 900, "modulus_low": 6, "modulus_high": 20, "strength_low": 30, "strength_high": 100},
    {"name": "Wood ⊥ grain", "category": "Natural materials", "density_low": 400, "density_high": 900, "modulus_low": 0.5, "modulus_high": 3, "strength_low": 2, "strength_high": 12},
    {"name": "Bamboo", "category": "Natural materials", "density_low": 500, "density_high": 800, "modulus_low": 15, "modulus_high": 25, "strength_low": 80, "strength_high": 160},
    {"name": "Cork", "category": "Natural materials", "density_low": 100, "density_high": 200, "modulus_low": 0.01, "modulus_high": 0.05, "strength_low": 0.5, "strength_high": 2},
    {"name": "Leather", "category": "Natural materials", "density_low": 800, "density_high": 1000, "modulus_low": 0.1, "modulus_high": 0.5, "strength_low": 5, "strength_high": 25},
    {"name": "Bone", "category": "Natural materials", "density_low": 1800, "density_high": 2100, "modulus_low": 8, "modulus_high": 25, "strength_low": 80, "strength_high": 170},
    # ====== FOAMS ======
    {"name": "Rigid Polymer Foam (HD)", "category": "Foams", "density_low": 100, "density_high": 300, "modulus_low": 0.1, "modulus_high": 1.0, "strength_low": 0.3, "strength_high": 5},
    {"name": "Rigid Polymer Foam (MD)", "category": "Foams", "density_low": 50, "density_high": 150, "modulus_low": 0.01, "modulus_high": 0.2, "strength_low": 0.1, "strength_high": 1},
    {"name": "Rigid Polymer Foam (LD)", "category": "Foams", "density_low": 20, "density_high": 80, "modulus_low": 0.005, "modulus_high": 0.1, "strength_low": 0.05, "strength_high": 0.5},
    {"name": "Flexible Polymer Foam", "category": "Foams", "density_low": 30, "density_high": 120, "modulus_low": 0.001, "modulus_high": 0.05, "strength_low": 0.01, "strength_high": 0.3},
    {"name": "Cork Foam", "category": "Foams", "density_low": 90, "density_high": 200, "modulus_low": 0.005, "modulus_high": 0.05, "strength_low": 0.1, "strength_high": 1},
    {"name": "Ceramic Foam", "category": "Foams", "density_low": 150, "density_high": 500, "modulus_low": 0.5, "modulus_high": 5, "strength_low": 0.5, "strength_high": 3},
    {"name": "Metal Foam", "category": "Foams", "density_low": 150, "density_high": 600, "modulus_low": 0.5, "modulus_high": 10, "strength_low": 0.5, "strength_high": 8},
    # ====== ELASTOMERS ======
    {"name": "Butyl Rubber", "category": "Elastomers", "density_low": 900, "density_high": 1100, "modulus_low": 0.001, "modulus_high": 0.005, "strength_low": 3, "strength_high": 7},
    {"name": "Natural Rubber", "category": "Elastomers", "density_low": 920, "density_high": 1050, "modulus_low": 0.001, "modulus_high": 0.01, "strength_low": 15, "strength_high": 30},
    {"name": "Neoprene", "category": "Elastomers", "density_low": 1200, "density_high": 1350, "modulus_low": 0.002, "modulus_high": 0.01, "strength_low": 5, "strength_high": 25},
    {"name": "Silicone Rubber", "category": "Elastomers", "density_low": 1050, "density_high": 1250, "modulus_low": 0.003, "modulus_high": 0.02, "strength_low": 2, "strength_high": 10},
    {"name": "Polyurethane Elast.", "category": "Elastomers", "density_low": 1000, "density_high": 1300, "modulus_low": 0.002, "modulus_high": 0.03, "strength_low": 20, "strength_high": 50},
]
