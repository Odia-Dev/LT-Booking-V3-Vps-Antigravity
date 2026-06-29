const fs = require('fs');

function processFile(filepath, entityName) {
    let content = fs.readFileSync(filepath, 'utf-8');
    
    // Imports
    content = content.replace('from "next/navigation";', 'from "next/navigation";\nimport { useParams } from "next/navigation";');
    
    // Component name
    content = content.replace(new RegExp(`Create${entityName}Page`, 'g'), `Edit${entityName}Page`);
    
    // State additions
    const routerDecl = 'const router = useRouter();';
    const idDecl = '  const params = useParams();\n  const id = params?.id as string;';
    content = content.replace(routerDecl, routerDecl + '\n' + idDecl);

    // Change API call to PUT
    content = content.replace(new RegExp(`fetch\\(\`\\$\\{apiBaseUrl\\}/api/admin/${entityName.toLowerCase()}s\`, \\{`), `fetch(\`\${apiBaseUrl}/api/admin/${entityName.toLowerCase()}s/\${id}\`, {`);
    content = content.replace('method: "POST"', 'method: "PUT"');

    // Change Texts
    content = content.replace(new RegExp(`Create New ${entityName}`, 'g'), `Edit ${entityName}`);
    content = content.replace(new RegExp(`Create ${entityName}`, 'g'), `Edit ${entityName}`);
    content = content.replace(new RegExp(`${entityName} created successfully`, 'g'), `${entityName} updated successfully`);
    
    if (entityName === 'Variant') {
        const fetchEffect = `
  useEffect(() => {
    if (!id) return;
    const fetchExisting = async () => {
      try {
        setLoading(true);
        const res = await fetch(\`\${apiBaseUrl}/api/variants/\${id}\`);
        const data = await res.json();
        if (res.ok && data.variant) {
          const v = data.variant;
          setName(v.name || "");
          setVehicleId(v.vehicleId || "");
          setTransmission(v.transmission || "Manual");
          setFuelType(v.fuelType || "Petrol");
          setSeating(v.seating || 5);
          setPrice(v.price ? String(v.price) : "");
          setBookingAmount(v.bookingAmount ? String(v.bookingAmount) : "");
          setStatus(v.status || "ACTIVE");
          
          setEngineSize(v.engineSize || "");
          setWaitingPeriodWeeks(v.waitingPeriodWeeks ? String(v.waitingPeriodWeeks) : "");
          
          if (v.specs) {
            setSafetyFeatures(v.specs.safetyFeatures?.join(", ") || "");
            setComfortFeatures(v.specs.comfortFeatures?.join(", ") || "");
            setExteriorFeatures(v.specs.exteriorFeatures?.join(", ") || "");
            setInteriorFeatures(v.specs.interiorFeatures?.join(", ") || "");
            setTechnologyFeatures(v.specs.technologyFeatures?.join(", ") || "");
            setPerformanceFeatures(v.specs.performanceFeatures?.join(", ") || "");
            setLength(v.specs.length || "");
            setWidth(v.specs.width || "");
            setHeight(v.specs.height || "");
            setWheelbase(v.specs.wheelbase || "");
            setGroundClearance(v.specs.groundClearance || "");
            setBootSpace(v.specs.bootSpace || "");
            setFuelTank(v.specs.fuelTank || "");
            setTyres(v.specs.tyres || "");
            setBrakes(v.specs.brakes || "");
            setSuspension(v.specs.suspension || "");
          }
        }
      } catch (err) {
        console.error("Failed to fetch variant:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExisting();
  }, [id, apiBaseUrl]);
`;
        content = content.replace('const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";', 'const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";\n' + fetchEffect);

    } else if (entityName === 'Branch') {
        const fetchEffect = `
  useEffect(() => {
    if (!id) return;
    const fetchExisting = async () => {
      try {
        setLoading(true);
        const res = await fetch(\`\${apiBaseUrl}/api/branches/\${id}\`);
        const data = await res.json();
        if (res.ok && data.branch) {
          const b = data.branch;
          setName(b.name || "");
          setCode(b.code || "");
          setAddress(b.address || "");
          setCity(b.city || "");
          setDistrict(b.district || "");
          setState(b.state || "");
          setPincode(b.pincode || "");
          setPhone(b.phone || "");
          setEmail(b.email || "");
          setGoogleMapsUrl(b.googleMapsUrl || "");
          setWorkingHours(b.workingHours || "");
          setLatitude(b.latitude ? String(b.latitude) : "");
          setLongitude(b.longitude ? String(b.longitude) : "");
          setSalesManager(b.salesManager || "");
          setServiceManager(b.serviceManager || "");
          setStatus(b.status || "ACTIVE");
          setSortOrder(b.sortOrder ? String(b.sortOrder) : "0");
        }
      } catch (err) {
        console.error("Failed to fetch branch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExisting();
  }, [id, apiBaseUrl]);
`;
        content = content.replace('const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";', 'const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";\n' + fetchEffect);
    }
    
    fs.writeFileSync(filepath, content, 'utf-8');
    console.log("Processed " + filepath);
}

processFile("src/app/admin/variants/[id]/edit/page.tsx", "Variant");
processFile("src/app/admin/branches/[id]/edit/page.tsx", "Branch");
