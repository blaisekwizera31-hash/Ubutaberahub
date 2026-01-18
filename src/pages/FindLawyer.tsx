import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  Search, 
  Star, 
  MapPin, 
  Phone, 
  Mail,
  Briefcase,
  Clock,
  Languages,
  ArrowLeft,
  Filter,
  CheckCircle2,
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";

const specializations = [
  'civil', 'criminal', 'family', 'commercial', 'land', 'labor', 'immigration', 'tax'
];

const locations = [
  'Kigali', 'Musanze', 'Rubavu', 'Huye', 'Rusizi', 'Muhanga', 'Nyagatare', 'Rwamagana'
];

export default function FindLawyer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('all');
  const [location, setLocation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: lawyers = [], isLoading } = useQuery({
    queryKey: ['lawyers'],
    queryFn: () => base44.entities.Lawyer.list('-rating', 50),
  });

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesSearch = !searchTerm || 
      lawyer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawyer.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = specialization === 'all' || 
      lawyer.specializations?.includes(specialization);
    
    const matchesLocation = location === 'all' || 
      lawyer.location === location;

    return matchesSearch && matchesSpecialization && matchesLocation && lawyer.verified;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Find a Lawyer</h1>
            <p className="text-slate-500">Connect with verified legal professionals</p>
          </div>
        </div>

        {/* Search & Filters */}
        <Card className="border-0 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search by name or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-slate-200 rounded-xl"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 rounded-xl gap-2 md:hidden"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <div className={`md:flex gap-4 ${showFilters ? 'flex flex-col md:flex-row' : 'hidden md:flex'}`}>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger className="w-full md:w-44 h-12 rounded-xl">
                    <SelectValue placeholder="Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    {specializations.map(spec => (
                      <SelectItem key={spec} value={spec} className="capitalize">
                        {spec.charAt(0).toUpperCase() + spec.slice(1)} Law
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-full md:w-36 h-12 rounded-xl">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <p className="text-slate-500 mb-6">
          {filteredLawyers.length} lawyer{filteredLawyers.length !== 1 ? 's' : ''} found
        </p>

        {/* Lawyers Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="border-0 shadow-sm animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
                    <div className="flex-1">
                      <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLawyers.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No lawyers found</h3>
            <p className="text-slate-500">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLawyers.map((lawyer, idx) => (
              <motion.div
                key={lawyer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-lg transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {lawyer.photo_url ? (
                        <img 
                          src={lawyer.photo_url} 
                          alt={lawyer.full_name}
                          className="w-16 h-16 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
                          <span className="text-xl font-bold text-white">
                            {lawyer.full_name?.charAt(0) || 'L'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 truncate">
                            {lawyer.full_name}
                          </h3>
                          {lawyer.verified && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-slate-700">
                            {lawyer.rating || '4.8'}
                          </span>
                          <span className="text-slate-400">
                            ({lawyer.total_cases || 0} cases)
                          </span>
                        </div>
                      </div>
                    </div>

                    {lawyer.specializations && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {lawyer.specializations.slice(0, 3).map((spec, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary"
                            className="bg-emerald-50 text-emerald-700 capitalize"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      {lawyer.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{lawyer.location}</span>
                        </div>
                      )}
                      {lawyer.experience_years && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          <span>{lawyer.experience_years} years experience</span>
                        </div>
                      )}
                      {lawyer.languages && (
                        <div className="flex items-center gap-2">
                          <Languages className="w-4 h-4 text-slate-400" />
                          <span>{lawyer.languages.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {lawyer.bio && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                        {lawyer.bio}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Link 
                        to={createPageUrl(`LawyerProfile?id=${lawyer.id}`)} 
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full rounded-xl">
                          View Profile
                        </Button>
                      </Link>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}