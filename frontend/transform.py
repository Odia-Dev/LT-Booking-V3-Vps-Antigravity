import re
import sys

def process_file(filepath, entity_name):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Imports
    content = content.replace('from "next/navigation";', 'from "next/navigation";\nimport { useParams } from "next/navigation";')
    
    # Component name
    content = content.replace(f'Create{entity_name}Page', f'Edit{entity_name}Page')
    
    # State additions
    router_decl = 'const router = useRouter();'
    id_decl = '  const params = useParams();\n  const id = params?.id as string;'
    content = content.replace(router_decl, router_decl + '\n' + id_decl)

    # Change API call to PUT
    content = content.replace(f'fetch(`${{apiBaseUrl}}/api/admin/{entity_name.lower()}s`, {{', f'fetch(`${{apiBaseUrl}}/api/admin/{entity_name.lower()}s/${{id}}`, {{')
    content = content.replace('method: "POST"', 'method: "PUT"')

    # Change Texts
    content = content.replace(f'Create New {entity_name}', f'Edit {entity_name}')
    content = content.replace(f'Create {entity_name}', f'Edit {entity_name}')
    content = content.replace(f'{entity_name} created successfully', f'{entity_name} updated successfully')
    
    if entity_name == 'Variant':
        # Variant specific state population
        fetch_effect = """
  useEffect(() => {
    if (!id) return;
    const fetchExisting = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBaseUrl}/api/variants/${id}`);
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
"""
        content = content.replace('const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";', 'const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";\n' + fetch_effect)

    elif entity_name == 'Branch':
        # Branch specific state population
        fetch_effect = """
  useEffect(() => {
    if (!id) return;
    const fetchExisting = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBaseUrl}/api/branches/${id}`);
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
"""
        content = content.replace('const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";', 'const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";\n' + fetch_effect)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filepath}")

if __name__ == "__main__":
    process_file("src/app/admin/variants/[id]/edit/page.tsx", "Variant")
    process_file("src/app/admin/branches/[id]/edit/page.tsx", "Branch")
